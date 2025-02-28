import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatDocument = HydratedDocument<BulkSection>;

@Schema()
export class Section extends Document {
  @Prop()
  ROW_NUMBER: number;

  @Prop()
  TERM: string;

  @Prop()
  COURSE: string;

  @Prop()
  TITLE: string;

  @Prop()
  SECTION: string;

  @Prop()
  CRN: string;

  @Prop()
  INSTRUCTION_METHOD: string;

  @Prop()
  DAYS: string;

  @Prop()
  TIMES: string;

  @Prop()
  LOCATION: string;

  @Prop()
  MAX: number;

  @Prop()
  NOW: number;

  @Prop()
  STATUS: string;

  @Prop()
  INSTRUCTOR: string;

  @Prop()
  COMMENTS: string;

  @Prop()
  CREDITS: number;

  @Prop()
  INFO_LINK: string;
}

@Schema()
export class BulkSection extends Document {
  @Prop({ type: [Section], default: [] })
  result: Section[];
}

export const CatSchema = SchemaFactory.createForClass(BulkSection);
