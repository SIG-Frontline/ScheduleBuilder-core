import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from '../../schemas/sections.schema';
import { sanitizeFilters } from 'src/utils/functions.utils';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
  ) {}

  async findSections(
    filters: Record<string, any>,
    page: number,
    sectionsPerPage: number,
  ) {
    try {
      const query = sanitizeFilters(filters);

      const sections = await this.sectionModel
        .find(query)
        .select(
          '_id SUBJECT COURSE TITLE SECTION DAYS INSTRUCTOR CRN CREDITS TERM IS_ASYNC',
        ) // Only get these necessary fields
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      const totalNumCourses = await this.sectionModel.countDocuments(query);

      return { courses: sections, totalNumCourses };
    } catch (error) {
      console.error(error);
      throw new Error('Database query failed');
    }
  }
}
