import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ collection: 'Sections' })
export class Course {
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

export const CourseSchema = SchemaFactory.createForClass(Course);
