import { Module } from '@nestjs/common';
import { BulkCrnsService } from './bulkCRNs.service';
import { BulkCrnsController } from './bulkCRNs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Section, SectionSchema } from 'schemas/sections.schema';

@Module({
  providers: [BulkCrnsService],
  exports: [BulkCrnsService],
  controllers: [BulkCrnsController],
  imports: [
    MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }]),
  ],
})
export class BulkCrnsModule {}
