import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { curriculaFilters } from 'src/utils/types.util';
import { CurriculaService } from './curricula.service';
import { Curricula } from 'schemas/curricula.schema';
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

  @Post('/')
  @ApiOkResponse({ description: 'Curricula document was created successfully' })
  @ApiResponse({ status: 400, description: 'No curricula were received' })
  @ApiOperation({
    summary: 'Used to create a curricula document for a given degree',
    description:
      'Creates a new curricula document in the database for the specified degree, storing all available course requirements and structure for that degree.',
  })
  async postCurricula(@Body() curricula: Curricula) {
    return this.curriculaService.createCurricula(curricula);
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'Curricula document has been deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not find a curricula document with the given id',
  })
  @ApiOperation({
    summary: 'Used to delete a curricula document given a specific id',
    description:
      'Deletes a curricula document in the database for the specified id. This is mainly used for the playwright tests, so that when POST is tested, we can then delete that',
  })
  async deleteCurricula(@Param('id') curriculaID: string) {
    return this.curriculaService.deleteCurricula(curriculaID);
  }
}
