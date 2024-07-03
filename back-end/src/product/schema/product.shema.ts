import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Product {
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

  @Prop()
  typeId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
