import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import {
  CourseStatic,
  CourseStaticSchema,
} from '../../schemas/courseStatic.schema';
import { CourseStaticController } from './courseStatic.controller';
import { CourseStaticService } from './courseStatic.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourseStatic.name, schema: CourseStaticSchema },
    ]),
  ],
  controllers: [CourseStaticController],
  providers: [CourseStaticService],
  exports: [CourseStaticService],
})
export class CourseStaticModule {}
