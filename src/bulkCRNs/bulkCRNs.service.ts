import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section } from 'schemas/sections.schema';
@Injectable()
export class BulkCrnsService {
  constructor(
    @InjectModel(Section.name)
    private sectionModel: Model<Section>,
  ) {}
  async findBulkCrns(crnArr: string[], term: string) {
    const sections = await this.sectionModel.find({
      CRN: { $in: crnArr },
      TERM: term,
    });
    const countofSections = sections.length;
    if (countofSections === 0) {
      throw new Error('No sections were found for the given CRNs');
    }
    return sections;
  }
}
