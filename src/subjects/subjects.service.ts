import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subjects } from 'schemas/subjects.schema';
import {
  SubjectInput,
  DataNotFoundException,
  SubjectsResponse,
  TermsResponse,
} from 'src/utils/types.util';

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
        throw new DataNotFoundException(
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

  async findTerms(
    sectionsPerPage: number,
    page: number,
  ): Promise<TermsResponse> {
    try {
      const query = { TERM: { $exists: true } };
      const terms = await this.subjectsModel
        .find(query)
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      if (!terms) {
        throw new DataNotFoundException(
          'No terms were found given the query parameters',
        );
      }

      let formattedTerms = [...new Set(terms.map((term) => term.TERM))];
      formattedTerms = formattedTerms.sort((a, b) => Number(b) - Number(a));
      return { terms: formattedTerms };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createSubjects(subjects: SubjectInput): Promise<SubjectsResponse> {
    if (!subjects) {
      throw new BadRequestException('No subjects were received');
    }
    const _id = new Types.ObjectId();
    const subjectsCreated = new this.subjectsModel({ _id, ...subjects });
    const savedDoc = await subjectsCreated.save();
    const response: SubjectsResponse = {
      _id: savedDoc._id,
      term: savedDoc.TERM,
      subjects: savedDoc.SUBJECTS,
    };
    return response;
  }

  async deleteSubjects(
    id: Types.ObjectId,
  ): Promise<{ deleted: boolean; message: string }> {
    if (!id) {
      throw new BadRequestException('No subject document id was received');
    }

    const result = await this.subjectsModel.findByIdAndDelete(id);

    if (!result) {
      throw new DataNotFoundException(
        'Could not find a subjects document with the given id',
      );
    }
    return {
      deleted: true,
      message: `Subject docuent has been deleted successfully`,
    };
  }
}
