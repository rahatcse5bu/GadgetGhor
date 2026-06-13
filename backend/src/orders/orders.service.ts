import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, ORDER_STATUSES } from './schemas/order.schema';
import { CreateOrderDto, UpdateStatusDto } from './dto/order.dto';
import { ProductsService } from '../products/products.service';
import { BundlesService } from '../bundles/bundles.service';
import { MailService } from '../mail/mail.service';

const FREE_SHIPPING_THRESHOLD = 5000;
const DHAKA_FEE = 60;
const OUTSIDE_FEE = 120;

function genOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(Math.random() * 1296)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0');
  return `GG-${ts}${rand}`;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private model: Model<OrderDocument>,
    private products: ProductsService,
    private bundles: BundlesService,
    private mail: MailService,
  ) {}

  private computeShipping(subtotal: number, city: string) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return /dhaka/i.test(city || '') ? DHAKA_FEE : OUTSIDE_FEE;
  }

  async create(dto: CreateOrderDto, userId?: string) {
    if (!dto.items?.length) throw new BadRequestException('Cart is empty');

    const resolvedItems = [];
    let subtotal = 0;

    for (const item of dto.items) {
      if (item.kind === 'bundle') {
        const bundle: any = await this.bundles.findOne(item.id);
        if (!bundle.isActive)
          throw new BadRequestException(`Bundle "${bundle.name}" is unavailable`);
        const price = bundle.bundlePrice;
        subtotal += price * item.quantity;
        resolvedItems.push({
          kind: 'bundle',
          refId: bundle._id,
          name: bundle.name,
          slug: bundle.slug,
          image: bundle.images?.[0] || bundle.items?.[0]?.product?.images?.[0] || '',
          price,
          quantity: item.quantity,
        });
      } else {
        const product: any = await this.products.findOne(item.id);
        if (!product.isActive)
          throw new BadRequestException(`"${product.name}" is unavailable`);
        if (product.stock < item.quantity)
          throw new BadRequestException(
            `Only ${product.stock} left of "${product.name}"`,
          );
        const price = product.price;
        subtotal += price * item.quantity;
        resolvedItems.push({
          kind: 'product',
          refId: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0] || '',
          price,
          quantity: item.quantity,
        });
      }
    }

    const shippingFee = this.computeShipping(
      subtotal,
      dto.shippingAddress.city,
    );
    const total = subtotal + shippingFee;

    // Reduce stock for products
    for (const it of resolvedItems) {
      if (it.kind === 'product') {
        await this.products.decrementStock(it.refId.toString(), it.quantity);
      }
    }

    const order = await this.model.create({
      orderNumber: genOrderNumber(),
      user: userId || null,
      customer: dto.customer,
      shippingAddress: dto.shippingAddress,
      items: resolvedItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod: dto.paymentMethod || 'cod',
      paymentStatus: 'unpaid',
      status: 'pending',
      customerNote: dto.customerNote || '',
      statusHistory: [
        { status: 'pending', note: 'Order placed', at: new Date() },
      ],
    });

    // Fire-and-forget confirmation email
    this.mail.sendOrderConfirmation(order.toObject()).catch(() => null);

    return order;
  }

  // Public order tracking (order number + email/phone match for privacy)
  async track(orderNumber: string, contact?: string) {
    const order = await this.model
      .findOne({ orderNumber: orderNumber.trim().toUpperCase() })
      .exec();
    if (!order) throw new NotFoundException('Order not found');

    if (contact) {
      const c = contact.trim().toLowerCase();
      const matches =
        order.customer.email.toLowerCase() === c ||
        order.customer.phone.replace(/\s/g, '') === contact.replace(/\s/g, '');
      if (!matches)
        throw new NotFoundException(
          'Order not found with that email/phone combination',
        );
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      trackingCarrier: order.trackingCarrier,
      trackingCode: order.trackingCode,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      customer: { name: order.customer.name },
      createdAt: (order as any).createdAt,
    };
  }

  // ===== Admin =====
  async adminFindAll(q: { status?: string; search?: string; page?: number }) {
    const filter: any = {};
    if (q.status) filter.status = q.status;
    if (q.search) {
      const rx = new RegExp(q.search.trim(), 'i');
      filter.$or = [
        { orderNumber: rx },
        { 'customer.name': rx },
        { 'customer.email': rx },
        { 'customer.phone': rx },
      ];
    }
    const page = Math.max(1, Number(q.page) || 1);
    const limit = 20;
    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, pages: Math.ceil(total / limit) || 1 };
  }

  async adminFindOne(id: string) {
    const order = await this.model.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    if (!ORDER_STATUSES.includes(dto.status as any))
      throw new BadRequestException('Invalid status');

    const order = await this.model.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    if (dto.trackingCarrier !== undefined)
      order.trackingCarrier = dto.trackingCarrier;
    if (dto.trackingCode !== undefined) order.trackingCode = dto.trackingCode;
    if (dto.paymentStatus) order.paymentStatus = dto.paymentStatus;
    order.statusHistory.push({
      status: dto.status,
      note: dto.note || '',
      at: new Date(),
    } as any);
    await order.save();

    this.mail.sendStatusUpdate(order.toObject(), dto.note).catch(() => null);

    return order;
  }

  async stats() {
    const [byStatus, totals, recent] = await Promise.all([
      this.model.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.model.aggregate([
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'cancelled'] }, 0, '$total'],
              },
            },
          },
        },
      ]),
      this.model.find().sort({ createdAt: -1 }).limit(8).exec(),
    ]);

    const statusCounts: Record<string, number> = {};
    byStatus.forEach((s) => (statusCounts[s._id] = s.count));

    return {
      totalOrders: totals[0]?.orders || 0,
      totalRevenue: totals[0]?.revenue || 0,
      statusCounts,
      recent,
    };
  }

  // Logged-in customer's own orders
  myOrders(userId: string) {
    return this.model.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }
}
