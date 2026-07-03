import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ trim: true, default: 'Uncategorized' })
  category: string;

  /**
   * Array of image URLs.
   * imageUrls[0] = primary/thumbnail image (shown on cards/listings)
   * imageUrls[1..n] = additional images (shown on detail page gallery)
   */
  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true, default: 'Casual' })
  wearType: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
