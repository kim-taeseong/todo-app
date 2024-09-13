import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: Date, default: null })
  lastLogin: Date | null;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  location: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 인덱스 추가
UserSchema.index({ username: 1 });
