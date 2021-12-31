import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document;
export type SpotifyDocument = Spotify & Document;
@Schema()
export class Release {
  @Prop({ default: '' })
  album_type: string;
  @Prop()
  artists: [];
  @Prop()
  available_markets: [];
  @Prop()
  external_urls: [];
  @Prop({ default: '' })
  href: string;
  @Prop({ default: '' })
  album_id: string;
  @Prop()
  images: [];
  @Prop({ default: '' })
  name: string;
  @Prop({ default: '' })
  release_date: string;
  @Prop({ default: '' })
  release_date_precision: string;
  @Prop({ default: 0 })
  total_tracks: number;
  @Prop({ default: '' })
  type: string;
  @Prop({ default: '' })
  uri: string;
}

export const ReleaseSchema = SchemaFactory.createForClass(Release);
@Schema()
export class Spotify {
  @Prop({ default: '' })
  spotify_id: string;
  @Prop({ default: '' })
  email: string;
  @Prop({ default: '' })
  access_token: string;
  @Prop({ default: 3600 })
  access_token_expires_in: number;
  @Prop({ default: new Date() })
  access_token_created: Date;
  @Prop({ default: '' })
  refresh_token: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Release' }] })
  releases: Release[];
}

export const SpotifySchema = SchemaFactory.createForClass(Spotify);

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ type: Spotify, default: new Spotify() })
  spotify: Spotify;
}

export const UserSchema = SchemaFactory.createForClass(User);
