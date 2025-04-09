import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { curriculaFilters } from 'src/utils/types.util';
import { CurriculaService } from './curricula.service';
import { Curricula } from 'schemas/curricula.schema';

@Controller('curricula')
export class CurriculaController {
  constructor(private readonly curriculaService: CurriculaService) {}

  @Get(':year/:degree/:major')
  async getCurricula(
    @Param('year') year: string,
    @Param('major') major: string,
    @Param('degree') degree: string,
  ) {
    const filters: curriculaFilters = {
      YEAR: year,
      MAJOR: major,
      DEGREE: degree,
    };

    return await this.curriculaService.findCurricula(filters, 0, 20);
  }

  @Post('/')
  async postCurricula(@Body() curricula: Curricula) {
    return this.curriculaService.createCurricula(curricula);
  }
}
