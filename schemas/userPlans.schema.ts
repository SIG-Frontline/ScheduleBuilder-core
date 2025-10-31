import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { PlanData } from '../src/utils/types.util';

export type UserPlansDocument = HydratedDocument<UserPlans>;

@Schema({ collection: 'User_Plans', versionKey: false })
export class UserPlans {
  @Prop()
  @ApiProperty()
  userId: string;

  @Prop()
  @ApiProperty()
  uuid: string;

  @Prop({ type: Object })
  @ApiProperty()
  plandata: PlanData;
}

export const UserPlansSchema = SchemaFactory.createForClass(UserPlans);
