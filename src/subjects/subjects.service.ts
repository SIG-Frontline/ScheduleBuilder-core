import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subjects } from 'schemas/subjects.schema';
import { SubjectsResponse } from 'src/utils/types.util';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subjects.name) private subjectsModel: Model<Subjects>,
  ) {}

  async findSubjects(
    term: string,
    sectionsPerPage: number,
    page: number,
  ): Promise<SubjectsResponse> {
    try {
      if (!term) {
        throw new BadRequestException('No term was received');
      }
      const query = { TERM: term };
      const subjects = await this.subjectsModel
        .findOne(query)
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      if (!subjects) {
        throw new NotFoundException(
          'No subjects found given the query parameters',
        );
      }
      const formattedSubjects = {
        _id: subjects._id,
        term: subjects.TERM,
        subjects: subjects.SUBJECTS,
      };

      return formattedSubjects;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
