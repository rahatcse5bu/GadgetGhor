import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
class Spec {
  @Prop() key: string;
  @Prop() value: string;
}
const SpecSchema = SchemaFactory.createForClass(Spec);

@Schema({ _id: false })
class Variant {
  // The option value shown to the customer, e.g. "Black", "128GB", "Large"
  @Prop({ required: true }) label: string;

  // Optional per-variant overrides. 0 / empty = fall back to the product value.
  @Prop({ default: 0, min: 0 }) price: number;
  @Prop({ default: 0, min: 0 }) stock: number;
  @Prop({ default: '' }) sku: string;

  // Per-variant media. When set, the storefront shows these instead of the
  // product's images/video while this variant is selected.
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop({ default: '' }) video: string;

  // Legacy single-image field, kept for backward compatibility.
  @Prop({ default: '' }) image: string;
}
const VariantSchema = SchemaFactory.createForClass(Variant);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  brand: string;

  @Prop({ default: 'accessories', index: true })
  category: string;

  // Optional finer grouping; slug of a sub-category whose parent is `category`.
  @Prop({ default: '', index: true })
  subcategory: string;

  // Selling price to customer (BDT)
  @Prop({ required: true, min: 0 })
  price: number;

  // Original / struck-through price for showing a discount
  @Prop({ default: 0, min: 0 })
  compareAtPrice: number;

  // Admin-only landed/import cost (never exposed to storefront)
  @Prop({ default: 0, min: 0, select: false })
  cost: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  // Optional product video: a YouTube/Vimeo link or a direct/Cloudinary video URL.
  @Prop({ default: '' })
  video: string;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: '' })
  sku: string;

  @Prop({ type: [SpecSchema], default: [] })
  specs: Spec[];

  // Single-axis product variations (e.g. Colour / Storage).
  @Prop({ default: false })
  hasVariants: boolean;

  // Name of the option group shown above the choices, e.g. "Colour".
  @Prop({ default: 'Variant' })
  variantLabel: string;

  @Prop({ type: [VariantSchema], default: [] })
  variants: Variant[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  featured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 4.6, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0 })
  numReviews: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
