import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private model: Model<CategoryDocument>,
  ) {}

  findAll(parent?: string) {
    const filter: any = {};
    if (parent === 'root') filter.parent = { $in: [null, ''] };
    else if (parent) filter.parent = parent;
    return this.model.find(filter).sort({ name: 1 }).exec();
  }

  // Returns top-level categories with their sub-categories nested under `children`.
  async tree(): Promise<any[]> {
    const all: any[] = await this.model.find().sort({ name: 1 }).lean().exec();
    const parents = all.filter((c) => !c.parent);
    return parents.map((p) => ({
      ...p,
      children: all.filter((c) => c.parent === p.slug),
    }));
  }

  async create(data: Partial<Category>) {
    const slug = data.slug || slugify(data.name);
    return this.model.create({ ...data, slug });
  }

  async update(id: string, data: Partial<Category>) {
    if (data.name && !data.slug) data.slug = slugify(data.name);
    const updated = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Category not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Category not found');
    return { deleted: true };
  }
}
