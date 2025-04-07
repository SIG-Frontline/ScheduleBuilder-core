import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseStatic,
  CourseStaticDocument,
} from 'schemas/courseStatic.schema';
import { DataNotFoundException } from 'src/utils/types.util';

@Injectable()
export class CourseStaticService {
  constructor(
    @InjectModel(CourseStatic.name)
    private courseStaticModel: Model<CourseStaticDocument>,
  ) {}

  async findCourseStatic(id: string) {
    try {
      const courseStatic = await this.courseStaticModel
        .findOne({ _id: id })
        .lean()
        .exec();
      if (!courseStatic) {
        throw new DataNotFoundException(
          'No course static found for the given course code',
        );
      }
      return courseStatic;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
