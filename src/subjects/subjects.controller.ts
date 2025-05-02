import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { Subjects, SubjectsInput } from 'schemas/subjects.schema';
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
  @ApiOkResponse({ description: 'Subjects document was created successfully' })
  @ApiResponse({ status: 400, description: 'No subjects were received' })
  @ApiOperation({
    summary: 'Used to upsert multiple subject documents that are sent to it',
    description:
      'Creates new subject documents based on the array of Subject documents it recieves. These are used to store all available course subjects for a given term.',
  })
  @ApiBody({ type: [Subjects] })
  async postSubjects(@Body() subjectsArr: SubjectsInput[]) {
    return this.subjectsService.bulkUpsertSubjects(subjectsArr);
  }

  @Delete('/subjects/:term')
  @ApiOkResponse({
    description: 'Subject document has been deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not find a subjects document with the given term',
  })
  @ApiOperation({
    summary: 'Used to delete a subjects document given a specific term',
    description:
      'Deletes a subjects document in the database for the specified term. This is mainly used for the playwright tests, so that when POST is tested, we can then delete that',
  })
  @ApiParam({ name: 'term', type: 'string' })
  async deleteSubjectsById(@Param('term') term: string) {
    return this.subjectsService.deleteSubjects(term);
  }

  @Get('/timestamp')
  async getTimestamp(@Query('term') term?: string) {
    if (term) {
      return this.subjectsService.findTimeStamp(term);
    }
    return this.subjectsService.findTimeStamp();
  }
}
