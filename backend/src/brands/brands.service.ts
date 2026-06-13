import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private model: Model<BrandDocument>) {}

  findAll() {
    return this.model.find().sort({ name: 1 }).exec();
  }

  findBySlug(slug: string) {
    return this.model.findOne({ slug }).exec();
  }

  create(data: Partial<Brand>) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    return this.model.create({ ...data, slug });
  }

  async update(id: string, data: Partial<Brand>) {
    if (data.name && !data.slug) data.slug = slugify(data.name);
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Brand not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Brand not found');
    return { deleted: true };
  }
}
