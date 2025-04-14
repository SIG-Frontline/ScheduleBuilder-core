import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { TreeNode } from 'src/utils/types.util';

export type CurriculaDocument = HydratedDocument<Curricula>;

@Schema({ collection: 'Curricula', versionKey: false })
export class Curricula {
  @Prop()
  @ApiProperty()
  _id: string;

  @Prop()
  @ApiProperty()
  SCHOOL: string;

  @Prop()
  @ApiProperty()
  DEGREE: string;

  @Prop()
  @ApiProperty()
  MAJOR: string;

  @Prop()
  @ApiProperty()
  YEAR: string;

  @Prop()
  @ApiProperty()
  UPDATED: number;

  @Prop()
  @ApiProperty()
  CLASSES: TreeNode[];
}

export const CurriculaSchema = SchemaFactory.createForClass(Curricula);
