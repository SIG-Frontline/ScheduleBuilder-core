import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SectionDocument = HydratedDocument<Section>;

@Schema({ collection: 'Sections' })
export class Section {
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

export const SectionSchema = SchemaFactory.createForClass(Section);
