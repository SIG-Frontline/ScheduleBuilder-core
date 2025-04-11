import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectInput } from 'src/utils/types.util';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get('subjects/:term')
  @ApiOkResponse({ description: 'List of subjects was returned successfully' })
  @ApiResponse({
    status: 404,
    description: 'No subjects were found given the query parameters',
  })
  @ApiOperation({
    summary: 'Used to find all the subjects for a given term',
    description:
      'Returns a list of all the subjects for a given term. This endpoint is used in the search feature.<br>Example: (/subjects/202510)',
  })
  async getSubjects(@Param('term') term: string) {
    const subjects = await this.subjectsService.findSubjects(term, 0, 20);
    return subjects;
  }

  @Get('/terms')
  @ApiOkResponse({ description: 'List of terms was returned successfully' })
  @ApiResponse({
    status: 404,
    description: 'No terms were found given the query parameters',
  })
  @ApiOperation({
    summary: 'Used to find all the terms we have data for in the database',
    description:
      'Returns a list of all the terms the app currently supports. This endpoint does not have any query parameters.',
  })
  async getTerms() {
    const terms = await this.subjectsService.findTerms(0, 20);
    return terms;
  }

  @Post('/subjects')
  async postSubjects(@Body() subjects: SubjectInput) {
    return this.subjectsService.createSubjects(subjects);
  }
}
