import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  image: string;

  // Slug of the parent category. Empty/null = top-level category.
  // When set, this category is a sub-category of `parent`.
  @Prop({ default: null, index: true })
  parent: string | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
