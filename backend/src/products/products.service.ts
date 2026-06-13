import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export interface ProductQuery {
  category?: string;
  subcategory?: string;
  search?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: string;
  sort?: string;
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private model: Model<ProductDocument>,
  ) {}

  async findAll(q: ProductQuery) {
    const filter: any = {};
    if (!q.includeInactive) filter.isActive = true;
    if (q.category) filter.category = q.category;
    if (q.subcategory) filter.subcategory = q.subcategory;
    if (q.brand) filter.brand = q.brand;
    if (q.featured === 'true') filter.featured = true;
    if (q.search) filter.$text = { $search: q.search };
    if (q.minPrice != null || q.maxPrice != null) {
      filter.price = {};
      if (q.minPrice != null) filter.price.$gte = Number(q.minPrice);
      if (q.maxPrice != null) filter.price.$lte = Number(q.maxPrice);
    }

    const sortMap: Record<string, any> = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      featured: { featured: -1, createdAt: -1 },
    };
    const sort = sortMap[q.sort] || sortMap.newest;

    const page = Math.max(1, Number(q.page) || 1);
    const limit = Math.min(60, Number(q.limit) || 12);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  async findBySlug(slug: string) {
    const product = await this.model.findOne({ slug }).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  findByIds(ids: string[]) {
    return this.model.find({ _id: { $in: ids } }).exec();
  }

  async findOne(id: string) {
    const product = await this.model.findById(id).select('+cost').exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: any) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    return this.model.create({ ...data, slug });
  }

  async update(id: string, data: any) {
    if (data.slug) data.slug = slugify(data.slug);
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Product not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Product not found');
    return { deleted: true };
  }

  async decrementStock(id: string, qty: number) {
    return this.model
      .findByIdAndUpdate(id, { $inc: { stock: -qty } }, { new: true })
      .exec();
  }

  // Admin listing including inactive products
  adminFindAll(q: ProductQuery) {
    return this.findAll({ ...q, includeInactive: true, limit: q.limit || 60 });
  }
}
