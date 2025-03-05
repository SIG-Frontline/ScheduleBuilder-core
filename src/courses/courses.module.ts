import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../../schemas/courses.schema';
import { Module } from '@nestjs/common';
import { CourseService } from './courses.service';
import { CourseController } from './courses.controller';
import { CourseStatic, CourseStaticSchema } from 'schemas/courseStatic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseStatic.name, schema: CourseStaticSchema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
