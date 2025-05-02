import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Section, SectionDocument } from 'schemas/sections.schema';
import { sanitizeFilters } from 'src/utils/functions.utils';
import {
  CourseStatic,
  CourseStaticDocument,
} from 'schemas/courseStatic.schema';
import {
  courseQueryFilters,
  CourseResponse,
  CourseSearchDBResult,
  DataNotFoundException,
} from 'src/utils/types.util';

@Injectable()
export class SectionService {
  constructor(
    @InjectModel(Section.name) private sectionModel: Model<SectionDocument>,
    @InjectModel(CourseStatic.name)
    private courseStaticModel: Model<CourseStaticDocument>,
  ) {}

  /**
   * Retrieves matching courses for a given term and search query .
   *
   * @param filters - The filters include subject, title, and the academic term (e.g., "202510").
   * @returns An object that contains an array of courses along with the total number of courses returned
   */
  async findCourses(filters: courseQueryFilters): Promise<CourseResponse> {
    try {
      const query = sanitizeFilters(filters);

      const courses: CourseSearchDBResult[] = await this.sectionModel
        .aggregate<CourseSearchDBResult>([
          { $match: query },
          { $sort: { _id: 1 } },
          { $group: { _id: '$COURSE', title: { $first: '$TITLE' } } },
          { $sort: { _id: 1 } },
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

      const numCourses = await this.sectionModel.countDocuments(query);

      return { courses: formattedCourses, totalNumCourses: numCourses };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Retrieves section data for a given term and course.
   *
   * @param filters - Filters include the course code (e.g., "CS332") and the academic term (e.g., "202510").
   * @returns A course object that contains an array of sections for the specified term.
   */
  async findSections(filters: courseQueryFilters) {
    try {
      const query = sanitizeFilters(filters);

      const sections = await this.sectionModel.find(query).lean().exec();

      if (sections.length === 0) {
        throw new DataNotFoundException(
          'No sections found given the query parameters',
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
      const totalNumCourses = await this.sectionModel.countDocuments(query);
      return { course: course, totalNumCourses };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async bulkUpsertSections(sectionsArr: Section[]) {
    if (!sectionsArr)
      throw new BadRequestException('No sections were received');

    const bulkOperations = sectionsArr.map((obj) => ({
      updateOne: {
        filter: { _id: obj['_id'] },
        update: { $set: { ...obj } },
        upsert: true,
      },
    }));

    const response = await this.sectionModel.bulkWrite(bulkOperations);
    return {
      success: response.isOk(),
      message: response.getWriteErrors().toString(),
    };
  }

  async deleteSection(
    sectionID: string,
  ): Promise<{ deleted: boolean; message: string }> {
    if (!sectionID) {
      throw new BadRequestException('No section id was received');
    }

    const result = await this.sectionModel.findByIdAndDelete(sectionID);

    if (!result) {
      throw new DataNotFoundException(
        'Could not find a sections document with the given id',
      );
    }
    return {
      deleted: true,
      message: 'Section document has been deleted successfully',
    };
  }

  async findBulkSections(filters: courseQueryFilters): Promise<Section[]> {
    try {
      const query = sanitizeFilters(filters);

      const sections = await this.sectionModel.find(query).lean().exec();

      if (sections.length === 0) {
        throw new DataNotFoundException(
          'No sections found given the query parameters',
        );
      }

      return sections;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
