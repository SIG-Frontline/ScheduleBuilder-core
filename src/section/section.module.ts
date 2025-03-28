import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from '../../schemas/sections.schema';
import { Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { CourseStatic, CourseStaticSchema } from 'schemas/courseStatic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Section.name, schema: SectionSchema },
      { name: CourseStatic.name, schema: CourseStaticSchema },
    ]),
  ],
  controllers: [SectionController],
  providers: [SectionService],
})
export class SectionModule {}
