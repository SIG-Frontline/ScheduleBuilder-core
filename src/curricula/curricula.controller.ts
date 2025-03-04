import { Controller, Get, Param } from '@nestjs/common';
import { curriculaFilters } from 'src/utils/types.util';
import { CurriculaService } from './curricula.service';

@Controller('curricula')
export class CurriculaController {
  constructor(private readonly curriculaService: CurriculaService) {}

  @Get(':year/:degree/:major')
  async getCurricula(
    @Param('year') year: string,
    @Param('major') major: string,
    @Param('degree') degree: string,
  ) {
    console.log('maybe');
    const filters: curriculaFilters = {
      YEAR: year,
      MAJOR: major,
      DEGREE: degree,
    };

    return await this.curriculaService.findCurricula(filters, 0, 20);
  }
}
