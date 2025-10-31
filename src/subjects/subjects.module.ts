import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { Subjects, SubjectsSchema } from '../../schemas/subjects.schema';
import { SubjectsService } from './subjects.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subjects.name, schema: SubjectsSchema },
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
