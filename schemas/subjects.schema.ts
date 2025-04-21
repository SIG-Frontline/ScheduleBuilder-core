import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type SubjectsDocument = HydratedDocument<Subjects>;

@Schema({ collection: 'Subjects', versionKey: false })
export class Subjects {
  @Prop()
  @ApiProperty({ readOnly: true })
  _id: string;

  @Prop()
  @ApiProperty()
  TERM: string;

  @Prop()
  @ApiProperty()
  SUBJECTS: Array<string>;
}
export type SubjectsInput = Omit<Subjects, '_id'>;
export const SubjectsSchema = SchemaFactory.createForClass(Subjects);
