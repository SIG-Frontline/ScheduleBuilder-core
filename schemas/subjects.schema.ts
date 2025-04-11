import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubjectsDocument = HydratedDocument<Subjects>;

@Schema({ collection: 'Subjects', versionKey: false })
export class Subjects {
  @Prop()
  _id: string;

  @Prop()
  TERM: string;

  @Prop()
  SUBJECTS: Array<string>;
}

export const SubjectsSchema = SchemaFactory.createForClass(Subjects);
