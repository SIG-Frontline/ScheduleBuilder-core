import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
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
  ApiQuery,
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
    Logger.log(`(SUBJECTS) GET: /subjects/${term}`);
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
    Logger.log(`(SUBJECTS) GET: /terms/`);
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
    Logger.log(`(SUBJECTS) POST: /subjects/`);
    try {
      return this.subjectsService.bulkUpsertSubjects(subjectsArr);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
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
    Logger.log(`(SUBJECTS) DELETE: /subjects/${term}`);
    try {
      return this.subjectsService.deleteSubjects(term);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Get('/timestamp')
  @ApiOperation({
    summary:
      'Used to get a timestamp which is equivalent to when the sections collection was last ran for a specified term',
    description:
      'Returns the most recently updated timestamp, if term is not passed. If term is passed it will find the timestamp for the specified term',
  })
  @ApiOkResponse({
    description: 'Timestamp was returned successfuly',
  })
  @ApiResponse({
    status: 404,
    description: 'No timestamp found for ${term}',
  })
  @ApiQuery({ name: 'term', type: 'string', required: false })
  async getTimestamp(@Query('term') term?: string) {
    Logger.log(`Request made to /timestamp/${term}`);
    if (term) {
      return this.subjectsService.findTimeStamp(term);
    }
    return this.subjectsService.findTimeStamp();
  }
}
