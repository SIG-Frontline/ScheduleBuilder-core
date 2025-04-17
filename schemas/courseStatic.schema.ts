import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CourseStaticNode } from 'src/utils/types.util';
import { ApiProperty } from '@nestjs/swagger';

export type CourseStaticDocument = HydratedDocument<CourseStatic>;

@Schema({ collection: 'Course_Static', versionKey: false })
export class CourseStatic {
  @Prop()
  @ApiProperty()
  _id: string;

  @Prop()
  @ApiProperty()
  course_number: string;

  @Prop()
  @ApiProperty()
  description: string;

  @Prop()
  @ApiProperty()
  prereq_str: string;

  @Prop()
  @ApiProperty()
  subject: string;

  @Prop()
  @ApiProperty()
  tree: CourseStaticNode;

  @Prop()
  @ApiProperty()
  updated: number;
}

export const CourseStaticSchema = SchemaFactory.createForClass(CourseStatic);
