import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Curricula, CurriculaDocument } from '../../schemas/curricula.schema';
import { sanitizeFilters } from '../utils/functions.utils';
import {
  queryFiltersBase,
  TreeNode,
  DataNotFoundException,
} from '../utils/types.util';
@Injectable()
export class CurriculaService {
  constructor(
    @InjectModel(Curricula.name)
    private curriculaModel: Model<CurriculaDocument>,
  ) {}

  /**
   * Retrieves the curricula courses for a given year, degree, and major
   *
   * @param filters - The filters include the query parameters year (e.g. '2025'), degree (e.g. 'BS'), and major (e.g. 'CS')
   * @returns An object that contains the curricula data for a given degree
   */
  async findCurricula(
    filters: queryFiltersBase,
    page: number,
    sectionsPerPage: number,
  ) {
    try {
      const query = sanitizeFilters(filters);
      const curricula = await this.curriculaModel
        .findOne(query)
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      if (!curricula) {
        throw new DataNotFoundException(
          'No curricula found given the query parameters',
        );
      }

      const formattedCurricula = {
        _id: curricula?._id,
        school: curricula?.SCHOOL,
        degree: curricula?.DEGREE,
        major: curricula?.MAJOR,
        year: curricula?.YEAR,
        updated: curricula?.UPDATED,
        // @ts-expect-error Typescript thinks this type is infinitly recursive, so ignore as we know it's not
        classes: curricula?.CLASSES as TreeNode[],
      };

      return formattedCurricula;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createCurricula(curricula: Curricula) {
    if (!curricula) {
      throw new BadRequestException('No curricula were received');
    }

    return await this.curriculaModel.updateOne(
      { _id: curricula['_id'] },
      { $set: { ...curricula } },
      { upsert: true },
    );
  }

  async deleteCurricula(
    curriculaID: string,
  ): Promise<{ deleted: boolean; message: string }> {
    if (!curriculaID) {
      throw new BadRequestException('No curricula id was received');
    }

    const result = await this.curriculaModel.findByIdAndDelete(curriculaID);

    if (!result) {
      throw new DataNotFoundException(
        'Could not find a curricula document with the given id',
      );
    }

    return {
      deleted: true,
      message: 'Curricula document has been deleted successfully',
    };
  }
}
