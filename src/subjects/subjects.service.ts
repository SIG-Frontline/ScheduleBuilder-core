import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subjects } from 'schemas/subjects.schema';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subjects.name) private subjectsModel: Model<Subjects>,
  ) {}

  async findSubjects(term: string, sectionsPerPage: number, page: number) {
    try {
      if (!term) {
        throw new BadRequestException('No term was received');
      }
      const query = { TERM: term };
      const subjects = await this.subjectsModel
        .find(query)
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      if (subjects.length === 0) {
        throw new NotFoundException(
          'No sections found given the query parameters',
        );
      }

      return subjects;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
