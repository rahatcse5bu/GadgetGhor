import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BundleDocument = HydratedDocument<Bundle>;

@Schema({ _id: false })
class BundleItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ default: 1, min: 1 })
  quantity: number;
}
const BundleItemSchema = SchemaFactory.createForClass(BundleItem);

@Schema({ timestamps: true })
export class Bundle {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [BundleItemSchema], default: [] })
  items: BundleItem[];

  // Special combined price for the whole bundle (BDT)
  @Prop({ required: true, min: 0 })
  bundlePrice: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  featured: boolean;
}

export const BundleSchema = SchemaFactory.createForClass(Bundle);
