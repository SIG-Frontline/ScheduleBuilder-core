import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { Days, MeetingTime } from 'src/utils/types.util';

export type SectionDocument = HydratedDocument<Section>;

@Schema({ collection: 'Sections', versionKey: false })
export class Section {
  @Prop({ type: String })
  @ApiProperty()
  _id: string;

  @Prop()
  @ApiProperty()
  TERM: string;

  @Prop()
  @ApiProperty()
  COURSE: string;

  @Prop()
  @ApiProperty()
  TITLE: string;

  @Prop()
  @ApiProperty()
  SECTION: string;

  @Prop()
  @ApiProperty()
  CRN: string;

  @Prop()
  @ApiProperty()
  INSTRUCTION_METHOD: string;

  @Prop({ type: Object })
  @ApiProperty()
  DAYS: Days;

  @Prop({ type: [Object] })
  @ApiProperty()
  TIMES: MeetingTime[];

  @Prop()
  @ApiProperty()
  LOCATION: string;

  @Prop()
  @ApiProperty()
  MAX: number;

  @Prop()
  @ApiProperty()
  NOW: number;

  @Prop()
  @ApiProperty()
  STATUS: string;

  @Prop()
  @ApiProperty()
  INSTRUCTOR: string;

  @Prop()
  @ApiProperty()
  COMMENTS: string;

  @Prop()
  @ApiProperty()
  CREDITS: number;

  @Prop()
  @ApiProperty()
  INFO_LINK: string;

  @Prop()
  @ApiProperty()
  IS_HONORS: boolean;

  @Prop()
  @ApiProperty()
  IS_ASYNC: boolean;

  @Prop()
  @ApiProperty()
  SUBJECT: string;

  @Prop()
  @ApiProperty()
  COURSE_LEVEL: number;

  @Prop()
  @ApiProperty()
  SUMMER_PERIOD: number;

  @Prop()
  @ApiProperty()
  UPDATED: number;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
