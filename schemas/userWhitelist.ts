import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserWhitelistDocument = HydratedDocument<UserWhitelist>;

@Schema({ collection: 'User_Whitelist', versionKey: false })
export class UserWhitelist {
  @Prop()
  userId: string;

  @Prop()
  email: string; // Encrypted string array
}

export const UserWhitelistSchema = SchemaFactory.createForClass(UserWhitelist);
