import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CourseStaticNode } from 'src/utils/types.util';

export type CourseStaticDocument = HydratedDocument<CourseStatic>;

@Schema({ collection: 'Course_Static', versionKey: false })
export class CourseStatic {
  @Prop()
  _id: string;

  @Prop()
  course_number: string;

  @Prop()
  description: string;

  @Prop()
  prereq_str: string;

  @Prop()
  subject: string;

  @Prop()
  tree: CourseStaticNode;

  @Prop()
  updated: number;
}

export const CourseStaticSchema = SchemaFactory.createForClass(CourseStatic);
