import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true })
export class Settings {
  // Fixed key so there is always a single settings document.
  @Prop({ default: 'global', unique: true })
  key: string;

  // ── Delivery charges (BDT) ──
  @Prop({ default: 60, min: 0 })
  dhakaDeliveryFee: number;

  @Prop({ default: 120, min: 0 })
  outsideDeliveryFee: number;

  // Subtotal at/above which delivery is free. 0 = free shipping disabled.
  @Prop({ default: 0, min: 0 })
  freeShippingThreshold: number;

  // ── Merchant wallet numbers shown to customers at checkout ──
  @Prop({ default: '' })
  bkashNumber: string;

  @Prop({ default: '' })
  nagadNumber: string;

  @Prop({ default: '' })
  rocketNumber: string;

  // Optional note shown in the payment section (e.g. "Use Send Money").
  @Prop({ default: '' })
  paymentInstructions: string;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
