import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subjects, SubjectsInput } from 'schemas/subjects.schema';
import {
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

  async bulkUpsertSubjects(subjectsArr: SubjectsInput[]) {
    if (!subjectsArr)
      throw new BadRequestException('No subjects were received');

    const bulkOperations = subjectsArr.map((obj) => ({
      updateOne: {
        filter: { TERM: obj.TERM },
        update: { $set: { ...obj } },
        upsert: true,
      },
    }));

    const response = await this.subjectsModel.bulkWrite(bulkOperations);
    return {
      success: response.isOk(),
      message: response.getWriteErrors().toString(),
    };
  }

  async deleteSubjects(
    term: string,
  ): Promise<{ deleted: boolean; message: string }> {
    if (!term) {
      throw new BadRequestException('No subject document id was received');
    }

    const result = await this.subjectsModel.findOneAndDelete({ TERM: term });

    if (!result) {
      throw new DataNotFoundException(
        'Could not find a subjects document with the given id',
      );
    }
    return {
      deleted: true,
      message: 'Subject document has been deleted successfully',
    };
  }
}
