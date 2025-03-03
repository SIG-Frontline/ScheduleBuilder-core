import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from '../../schemas/sections.schema';
import { sanitizeFilters } from 'src/utils/functions.utils';
import {
  CourseStatic,
  CourseStaticDocument,
} from 'schemas/courseStatic.schema';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(CourseStatic.name)
    private courseStaticModel: Model<CourseStaticDocument>,
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
        // .select(
        //   '_id SUBJECT COURSE TITLE SECTION DAYS INSTRUCTOR CRN CREDITS TERM IS_ASYNC',
        // ) // Only get these necessary fields
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      // INCLUDE THIS IF WANT TO HANDLE NOT FOUND EXCEPTION IN FRONTEND
      // ALTERNATIVE IS TO JUST HANDLE THIS ON FE

      // if (sections.length === 0) {
      //   throw new NotFoundException(
      //     'No sections found given the query paramters',
      //   );
      // }

      const [courseSubject, courseCode] = sections[0].COURSE.split(' ');
      const courseStatic = await this.courseStaticModel.findOne({
        subject: courseSubject,
        course_number: courseCode,
      });

      const course = {
        _id: sections[0].COURSE,
        title: sections[0].TITLE,
        credits: sections[0].CREDITS,
        description: courseStatic?.description || null,
        sections: sections,
      };
      const totalNumCourses = await this.sectionModel.countDocuments(query);
      return { course: course, totalNumCourses };
    } catch (error) {
      console.error(error);
      throw new Error('Database query failed');
    }
  }
}
