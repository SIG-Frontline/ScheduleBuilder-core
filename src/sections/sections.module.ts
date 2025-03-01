import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from '../../schemas/sections.schema';
import { Module } from '@nestjs/common';
import { SectionService } from './sections.service';
import { SectionsController } from './sections.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }]),
  ],
  controllers: [SectionsController],
  providers: [SectionService],
})
export class SectionsModule {}
