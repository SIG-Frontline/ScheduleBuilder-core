import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Days, MeetingTime } from 'src/utils/types.util';

export type SectionDocument = HydratedDocument<Section>;

@Schema({ collection: 'Sections' })
export class Section {
  @Prop()
  _id: number;

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

  @Prop({ type: Object })
  DAYS: Days;

  @Prop({ type: [Object] })
  TIMES: MeetingTime[];

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

  @Prop()
  IS_HONORS: boolean;

  @Prop()
  IS_ASYNC: boolean;

  @Prop()
  SUBJECT: string;

  @Prop()
  COURSE_LEVEL: number;

  @Prop()
  SUMMER_PERIOD: boolean;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
