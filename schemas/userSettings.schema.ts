import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserSettingsDocument = HydratedDocument<UserSettings>;

@Schema({ collection: 'User_Settings', versionKey: false })
export class UserSettings {
  @Prop()
  userId: string;

  @Prop()
  takenCourses: string[];
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
