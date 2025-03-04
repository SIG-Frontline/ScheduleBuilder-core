import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CurriculaClasses } from 'src/utils/types.util';

export type CurriculaDocument = HydratedDocument<Curricula>;

@Schema({ collection: 'Curricula' })
export class Curricula {
  @Prop()
  _id: string;

  @Prop()
  SCHOOL: string;

  @Prop()
  DEGREE: string;

  @Prop()
  MAJOR: string;

  @Prop()
  YEAR: string;

  @Prop()
  Classes: CurriculaClasses;
}

export const CurriculaSchema = SchemaFactory.createForClass(Curricula);
