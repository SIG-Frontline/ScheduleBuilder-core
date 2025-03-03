import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TreeType } from 'src/utils/types.util';

export type CourseStaticDocument = HydratedDocument<CourseStatic>;

@Schema({ collection: 'Course_Static' })
export class CourseStatic {
  @Prop()
  _id: string;

  @Prop()
  prereq_str: string;

  @Prop()
  description: string;

  @Prop()
  subject: string;

  @Prop()
  course_number: string;

  @Prop()
  tree: TreeType;
}

export const CourseStaticSchema = SchemaFactory.createForClass(CourseStatic);
