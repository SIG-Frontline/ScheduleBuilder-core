import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PlanData } from 'src/utils/types.util';

export type UserPlansDocument = HydratedDocument<UserPlans>;

@Schema({ collection: 'User_Plans' })
export class UserPlans {
  @Prop()
  userId: string;

  @Prop()
  uuid: string;

  @Prop({ type: Object })
  plandata: PlanData;
}

export const UserPlansSchema = SchemaFactory.createForClass(UserPlans);
