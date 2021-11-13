import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchoolDocument = School & Document;

export class SchoolAddress {
  street: string;
  postalCode: number;
  city: string;
}

@Schema()
export class School {
  @Prop({ required: true })
  name: string;
  @Prop()
  address: SchoolAddress;
}

export const SchoolSchema = SchemaFactory.createForClass(School);
