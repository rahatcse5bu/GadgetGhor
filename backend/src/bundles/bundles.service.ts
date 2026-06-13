import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bundle, BundleDocument } from './schemas/bundle.schema';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

@Injectable()
export class BundlesService {
  constructor(
    @InjectModel(Bundle.name) private model: Model<BundleDocument>,
  ) {}

  private populate(query: any) {
    return query.populate({
      path: 'items.product',
      select: 'name slug price images stock isActive',
    });
  }

  // Add computed regular price + savings for storefront display
  private withSavings(bundle: any) {
    const b = bundle.toObject ? bundle.toObject() : bundle;
    const regularPrice = (b.items || []).reduce((sum: number, it: any) => {
      const price = it.product?.price || 0;
      return sum + price * (it.quantity || 1);
    }, 0);
    return {
      ...b,
      regularPrice,
      savings: Math.max(0, regularPrice - b.bundlePrice),
    };
  }

  async findAll(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    const bundles = await this.populate(
      this.model.find(filter).sort({ createdAt: -1 }),
    ).exec();
    return bundles.map((b) => this.withSavings(b));
  }

  async findBySlug(slug: string) {
    const bundle = await this.populate(this.model.findOne({ slug })).exec();
    if (!bundle) throw new NotFoundException('Bundle not found');
    return this.withSavings(bundle);
  }

  async findOne(id: string) {
    const bundle = await this.populate(this.model.findById(id)).exec();
    if (!bundle) throw new NotFoundException('Bundle not found');
    return this.withSavings(bundle);
  }

  async create(data: any) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const created = await this.model.create({ ...data, slug });
    return this.findOne(created._id.toString());
  }

  async update(id: string, data: any) {
    if (data.slug) data.slug = slugify(data.slug);
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Bundle not found');
    return this.findOne(id);
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Bundle not found');
    return { deleted: true };
  }
}
