import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop()
  name: string;

  @Prop({ default: '' })
  image: string;

  @Prop()
  description: string;

  @Prop()
  originalPrice: number;

  @Prop()
  salePrice: number;

  @Prop()
  dialSize: number;

  @Prop()
  thickness: number;

  @Prop()
  dialColor: string;

  @Prop()
  movementType: string;

  @Prop()
  strapSize: number;

  @Prop()
  waterResistance: string;

  @Prop()
  glassMaterial: string;

  @Prop()
  strapMaterial: string;

  @Prop({ type: Types.ObjectId, ref: 'type' }) // Thêm ref để chỉ ra collection liên quan
  typeId: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
