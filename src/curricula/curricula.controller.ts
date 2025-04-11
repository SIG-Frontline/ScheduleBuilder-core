import { Controller, Get, Param } from '@nestjs/common';
import { curriculaFilters } from 'src/utils/types.util';
import { CurriculaService } from './curricula.service';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('curricula')
export class CurriculaController {
  constructor(private readonly curriculaService: CurriculaService) {}

  @Get(':year/:degree/:major')
  @ApiOkResponse({ description: 'Curricula was returned successfully' })
  @ApiResponse({
    status: 404,
    description: 'No curricula found given the query parameters',
  })
  @ApiOperation({
    summary:
      'Used to return the required courses for a given catalog year, degree & degree',
    description:
      'Returns static information for a given catalog year, degree & major. This endpoint is heavily used in the schedule builder course recommender feature. <br> Example endpoint: (curricula/2025/BS/CS)',
  })
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
}
