import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CourseStatic,
  CourseStaticDocument,
} from '../../schemas/courseStatic.schema';
import { CourseStaticNode, DataNotFoundException } from '../utils/types.util';

@Injectable()
export class CourseStaticService {
  constructor(
    @InjectModel(CourseStatic.name)
    private courseStaticModel: Model<CourseStatic>,
  ) {}

  private courses: CourseStaticDocument[] = [];
  private lastRetrieved: Date | null = null;

  private async getCachedData(): Promise<CourseStaticDocument[]> {
    const now = new Date();

    // Queries the database for all prereqs if and caches it
    if (
      !this.lastRetrieved ||
      now.getTime() - this.lastRetrieved.getTime() > 3600000
    ) {
      this.lastRetrieved = now;
      try {
        Logger.log('(COURSE_STATIC): Updating cache');
        const courseStatic = await this.courseStaticModel.find().lean().exec();
        if (!courseStatic) {
          throw new DataNotFoundException(
            'No course static found for the given courseCode.',
          );
        }

        // @ts-expect-error Typescript thinks this type is infinitly recursive, so ignore as we know it's not
        this.courses = courseStatic;
      } catch (error) {
        Logger.error(error);
        throw error;
      }
    }

    return this.courses;
  }

  async findCourseStatic(id: string) {
    const courses = await this.getCachedData();
    const course = courses.filter((item) => item._id === id)[0];

    // Can be null
    return course;
  }

  async bulkUpsertCourseStatic(courseStaticArr: CourseStatic[]) {
    if (!courseStaticArr)
      throw new BadRequestException('No course static was received');

    const bulkOperations = courseStaticArr.map((obj) => ({
      updateOne: {
        filter: { _id: obj['_id'] },
        update: { $set: { ...obj } },
        upsert: true,
      },
    }));

    const response = await this.courseStaticModel.bulkWrite(bulkOperations);
    return {
      success: response.isOk(),
      message: response.getWriteErrors().toString(),
    };
  }

  async validatePrereqs(course: string, requisites: string[]) {
    const staticData = await this.findCourseStatic(course);

    // Bias true if we can't find data
    if (staticData === undefined) return true;

    return checkPrereqTree(staticData.tree, requisites);
  }

  async deleteCourseStatic(
    courseStaticID: string,
  ): Promise<{ deleted: boolean; message: string }> {
    if (!courseStaticID) {
      throw new BadRequestException('No course static id was received');
    }

    const result =
      await this.courseStaticModel.findByIdAndDelete(courseStaticID);

    if (!result) {
      throw new DataNotFoundException(
        'Could not find a course static document with the given id',
      );
    }

    return {
      deleted: true,
      message: 'Course static document has been deleted successfully',
    };
  }
}

function checkPrereqTree(tree: CourseStaticNode, requisites: string[]) {
  if (tree === null || tree === undefined || tree.length <= 0) return true;
  if (typeof tree === 'string') return handlePrereq(tree, requisites);

  const is_and = tree[0] === '&';

  for (let i = 1; i < tree.length; i++) {
    let is_condition_valid = false;
    if (typeof tree[i] === 'string') {
      is_condition_valid = handlePrereq(tree[i] as string, requisites);
    } else {
      is_condition_valid = checkPrereqTree(
        tree[i] as CourseStaticNode,
        requisites,
      );
    }

    if (is_and && !is_condition_valid) {
      // Check Failed; condition is AND and one of the courses are not present
      return false;
    } else if (!is_and && is_condition_valid) {
      // Check Succeeded; condition is OR and one of the courses is present
      return true;
    }
    // Other cases:
    // - Condition is AND and one of the courses is present; continue
    // - Condition is OR and one of the courses is not present; continue
  }

  // Cases:
  // - is_and == true; We reach the end of the loop if everything is present; return true
  // - is_and == false; We reach the end of the loop if nothing is present; return false
  return is_and;
}

const histHums = [
  'COM',
  'LIT',
  'PHIL',
  'PSY',
  'STS',
  'THTR',
  'HIST',
  'R510',
  'R512',
];

function handlePrereq(prereq: string, requisites: string[]) {
  if (prereq.includes('-')) {
    // Corequisites
    // TODO: handle corequisites
    return true;
  } else if (prereq.includes('$')) {
    // Special "variables"
    // TODO: handle more special "variables"

    // Checks for history/humanities 200-level (not fully accurate)
    if (prereq == '$GER200') {
      for (const req of requisites) {
        const course = req.split(' ')[0];
        const num = req.split(' ')[1];

        for (const histHum of histHums) {
          if (course.includes(histHum) && Number(num[0]) >= 2) return true;
        }
      }
    }

    return false;
  }

  return requisites.includes(prereq);
}
