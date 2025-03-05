import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from '../../schemas/courses.schema';
import { sanitizeFilters } from 'src/utils/functions.utils';
import {
  CourseStatic,
  CourseStaticDocument,
} from 'schemas/courseStatic.schema';
import {
  courseQueryFilters,
  CourseResponse,
  CourseSearchDBResult,
} from 'src/utils/types.util';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(CourseStatic.name)
    private courseStaticModel: Model<CourseStaticDocument>,
  ) {}

  /**
   * Retrieves matching courses for a given term and search query .
   *
   * @param term - The academic term (e.g., "202510").
   * @param filters - The filters include subject, title,
   * @returns An object that contains an array of courses along with the total number of courses returned
   */
  async findCourses(
    filters: courseQueryFilters,
    page: number,
    sectionsPerPage: number,
  ): Promise<CourseResponse> {
    try {
      const query = sanitizeFilters(filters);

      const courses: CourseSearchDBResult[] = await this.courseModel
        .aggregate<CourseSearchDBResult>([
          { $match: query },
          { $group: { _id: '$COURSE', title: { $first: '$TITLE' } } },
          { $sort: { _id: 1 } },
          { $skip: sectionsPerPage * page },
          { $limit: sectionsPerPage },
        ])
        .exec();

      const formattedCourses = courses.map((course) => {
        const [subject, courseCode] = course._id.split(' ');
        return {
          _id: courseCode,
          title: course.title,
          subject: subject,
        };
      });

      const numCourses = await this.courseModel.countDocuments(query);

      return { courses: formattedCourses, totalNumCourses: numCourses };
    } catch (error) {
      console.error(error);
      throw new Error('Database query failed');
    }
  }

  /**
   * Retrieves section data for a given term and course.
   *
   * @param term - The academic term (e.g., "202510").
   * @param course - The course code (e.g., "CS332").
   * @returns A course object that contains an array of sections for the specified term.
   */
  async findSections(
    filters: courseQueryFilters,
    page: number,
    sectionsPerPage: number,
  ) {
    try {
      const query = sanitizeFilters(filters);

      const sections = await this.courseModel
        .find(query)
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      if (sections.length === 0) {
        throw new NotFoundException(
          'No sections found given the query paramters',
        );
      }

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
      const totalNumCourses = await this.courseModel.countDocuments(query);
      return { course: course, totalNumCourses };
    } catch (error) {
      console.error(error);
      if (!(error instanceof NotFoundException)) {
        throw new Error('Database query failed');
      }
      throw error;
    }
  }
}
