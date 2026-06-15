import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned',
] as const;

@Schema({ _id: false })
class OrderItem {
  @Prop({ enum: ['product', 'bundle'], default: 'product' })
  kind: string;

  @Prop({ type: Types.ObjectId, required: true })
  refId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop() slug: string;
  @Prop() image: string;

  // Selected variant label (e.g. "Black"), empty when the product has no variants.
  @Prop({ default: '' })
  variant: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
class Customer {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop({ required: true }) phone: string;
}
const CustomerSchema = SchemaFactory.createForClass(Customer);

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true }) address: string;
  @Prop() area: string;
  @Prop({ required: true }) city: string;
  @Prop() postcode: string;
}
const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ _id: false })
class StatusEvent {
  @Prop({ required: true }) status: string;
  @Prop({ default: '' }) note: string;
  @Prop({ type: Date, default: Date.now }) at: Date;
}
const StatusEventSchema = SchemaFactory.createForClass(StatusEvent);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  user: Types.ObjectId | null;

  @Prop({ type: CustomerSchema, required: true })
  customer: Customer;

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  shippingFee: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ enum: ['cod', 'bkash', 'nagad', 'card'], default: 'cod' })
  paymentMethod: string;

  @Prop({ enum: ['unpaid', 'partial', 'paid', 'refunded'], default: 'unpaid' })
  paymentStatus: string;

  // ── Payment proof ──
  // Wallet the customer paid from: bkash / nagad / rocket (for COD advance,
  // or equal to paymentMethod for online payments).
  @Prop({ default: '' })
  paymentChannel: string;

  // Customer's wallet number the payment was sent from.
  @Prop({ default: '' })
  paymentNumber: string;

  @Prop({ default: '' })
  transactionId: string;

  // Amount already paid (delivery charge for COD, or full total for online).
  @Prop({ default: 0, min: 0 })
  amountPaid: number;

  // Amount still due (collected on delivery for COD).
  @Prop({ default: 0, min: 0 })
  dueAmount: number;

  @Prop({ enum: ORDER_STATUSES, default: 'pending', index: true })
  status: string;

  @Prop({ default: '' })
  trackingCarrier: string;

  @Prop({ default: '' })
  trackingCode: string;

  @Prop({ type: [StatusEventSchema], default: [] })
  statusHistory: StatusEvent[];

  @Prop({ default: '' })
  customerNote: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
