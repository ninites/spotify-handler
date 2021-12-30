import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;
@Schema()
class Spotify {
  @Prop()
  id: string
  @Prop()
  email: string
  @Prop()
  releases: { [key: string]: any }[];
}
@Schema()
export class User {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Spotify' })
  spotify: Spotify
}

export const UserSchema = SchemaFactory.createForClass(User);
