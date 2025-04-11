import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TreeNode } from 'src/utils/types.util';

export type CurriculaDocument = HydratedDocument<Curricula>;

@Schema({ collection: 'Curricula', versionKey: false })
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
  UPDATED: number;

  @Prop()
  CLASSES: TreeNode[];
}

export const CurriculaSchema = SchemaFactory.createForClass(Curricula);
