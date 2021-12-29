import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  releases: { [key: string]: any }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
