import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Curricula, CurriculaDocument } from 'schemas/curricula.schema';
import { sanitizeFilters } from 'src/utils/functions.utils';
import { queryFiltersBase, TreeNode } from 'src/utils/types.util';

@Injectable()
export class CurriculaService {
  constructor(
    @InjectModel(Curricula.name)
    private curriculaModel: Model<CurriculaDocument>,
  ) {}

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
        throw new BadRequestException(
          'No sections found given the query parameters',
        );
      }

      const formattedCurricula = {
        _id: curricula?._id,
        school: curricula?.SCHOOL,
        degree: curricula?.DEGREE,
        major: curricula?.MAJOR,
        year: curricula?.YEAR,
        classes: curricula?.CLASSES as TreeNode[],
      };

      return formattedCurricula;
    } catch (error) {
      console.error(error);
      if (!(error instanceof BadRequestException)) {
        throw new Error('Database query failed');
      }
      throw error;
    }
  }
}
