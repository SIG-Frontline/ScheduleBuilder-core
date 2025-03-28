import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseStatic,
  CourseStaticDocument,
} from 'schemas/courseStatic.schema';

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
        throw new NotFoundException('No course static found given the id');
      }
      return courseStatic;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
