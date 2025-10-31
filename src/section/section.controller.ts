import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { Section } from 'schemas/sections.schema';
import { courseQueryFilters } from 'src/utils/types.util';
import { addRegexSearch } from 'src/utils/functions.utils';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
@Controller('')
export class SectionController {
  constructor(private readonly SectionService: SectionService) {}

  @Get('courseSearch')
  @ApiOkResponse({ description: 'List of courses was returned successfuly' })
  @ApiBadRequestResponse({ description: 'No term was received' })
  @ApiResponse({
    status: 404,
    description: 'No courses found given the query parameters',
  })
  @ApiOperation({
    summary: 'Used to return a list of courses for a given search query',
    description: `Returns static information for a given course search. This endpoint is critical to the search feature. <br>All queries require the term. Courses can be searched by a subject, course code, or by title. Subject & title searches are regex-based allowing for partial matches.<br>Example: (/courseSearch?term=202510&title=roadmap, /courseSearch?term=202510&subject=MATH)`,
  })
  @ApiQuery({ name: 'term', type: 'string', required: true })
  @ApiQuery({ name: 'course', type: 'string', required: true })
  @ApiQuery({ name: 'title', type: 'string', required: true })
  @ApiQuery({ name: 'subject', type: 'string', required: true })
  @ApiQuery({ name: 'instructor', type: 'string', required: false })
  @ApiQuery({ name: 'honors', type: 'string', required: false })
  @ApiQuery({ name: 'async', type: 'string', required: false })
  @ApiQuery({ name: 'credits', type: 'string', required: false })
  @ApiQuery({ name: 'level', type: 'string', required: false })
  @ApiQuery({ name: 'summer', type: 'string', required: false })
  @ApiQuery({ name: 'method', type: 'string', required: false })
  async getCourses(
    @Req() req: Request,
    @Query('term') term?: string,
    @Query('course') course?: string,
    @Query('title') title?: string,
    @Query('subject') subject?: string,
    @Query('instructor') instructor?: string,
    @Query('honors') honors?: string,
    @Query('async') isAsync?: string,
    @Query('credits') credits?: string,
    @Query('level') level?: string,
    @Query('summer') summer?: string,
    @Query('method') method?: string,
  ) {
    try {
      const query: courseQueryFilters = {};
      if (!term) {
        throw new BadRequestException('No term was received');
      }

      if (title) addRegexSearch(query, 'TITLE', title);
      if (subject) addRegexSearch(query, 'SUBJECT', subject);

      const filters: courseQueryFilters = {
        ...query,
        ...(term ? { TERM: term } : {}),
        ...(course ? { COURSE: course } : {}),
        ...(instructor ? { INSTRUCTOR: instructor } : {}),
        ...(honors ? { IS_HONORS: honors === 'true' } : {}),
        ...(isAsync ? { IS_ASYNC: isAsync === 'true' } : {}),
        ...(credits && !isNaN(Number(credits))
          ? { CREDITS: Number(credits) }
          : {}),
        ...(level
          ? level.toLowerCase() === 'u'
            ? { COURSE_LEVEL: { $in: [1, 2, 3, 4] } }
            : level.toLowerCase() === 'g'
              ? { COURSE_LEVEL: { $in: [5, 6, 7] } }
              : {}
          : {}),
        ...(summer ? { SUMMER_PERIOD: summer } : {}),
        ...(method ? { INSTRUCTION_METHOD: method } : {}),
      };

      Logger.log(
        `(SECTIONS) GET: /courseSearch${'?' + req.url.split('?')[1] || ''}`,
      );
      return await this.SectionService.findCourses(filters);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Get('sections')
  @ApiOkResponse({ description: 'List of sections was returned successfully' })
  @ApiBadRequestResponse({
    description: 'Term and course are required query parameter',
  })
  @ApiResponse({
    status: 404,
    description: 'No sections found given the query parameters',
  })
  @ApiOperation({
    summary: 'Used to return a list of sections for a given course',
    description:
      'Returns static course section information. This endpoint is critical for users to find the sections for a given course. <br>All queries require the term and the courseCode. <br>Example: (/section?term=202510&course=CS 100)',
  })
  @ApiQuery({ name: 'term', type: 'string', required: true })
  @ApiQuery({ name: 'course', type: 'string', required: true })
  @ApiQuery({ name: 'title', type: 'string', required: false })
  @ApiQuery({ name: 'subject', type: 'string', required: false })
  @ApiQuery({ name: 'instructor', type: 'string', required: false })
  @ApiQuery({ name: 'honors', type: 'string', required: false })
  @ApiQuery({ name: 'async', type: 'string', required: false })
  @ApiQuery({ name: 'credits', type: 'string', required: false })
  @ApiQuery({ name: 'level', type: 'string', required: false })
  @ApiQuery({ name: 'summer', type: 'string', required: false })
  @ApiQuery({ name: 'method', type: 'string', required: false })
  async getSections(
    @Req() req: Request,
    @Query('term') term?: string,
    @Query('course') course?: string,
    @Query('title') title?: string,
    @Query('subject') subject?: string,
    @Query('instructor') instructor?: string,
    @Query('honors') honors?: string,
    @Query('async') isAsync?: string,
    @Query('credits') credits?: string,
    @Query('level') level?: string,
    @Query('summer') summer?: string,
    @Query('method') method?: string,
  ) {
    if (!term || !course) {
      throw new BadRequestException(
        'Term and course are required query parameters',
      );
    }
    try {
      const filters: courseQueryFilters = {
        ...(term ? { TERM: term } : {}),
        ...(course ? { COURSE: course } : {}),
        ...(title ? { TITLE: title } : {}),
        ...(subject ? { SUBJECT: subject } : {}),
        ...(instructor ? { INSTRUCTOR: instructor } : {}),
        ...(honors ? { IS_HONORS: honors === 'true' } : {}),
        ...(isAsync ? { IS_ASYNC: isAsync === 'true' } : {}),
        ...(credits && !isNaN(Number(credits))
          ? { CREDITS: Number(credits) }
          : {}),
        ...(level
          ? level.toLowerCase() === 'u'
            ? { COURSE_LEVEL: { $in: [1, 2, 3, 4] } }
            : level.toLowerCase() === 'g'
              ? { COURSE_LEVEL: { $in: [5, 6, 7] } }
              : {}
          : {}),
        ...(summer ? { SUMMER_PERIOD: summer } : {}),
        ...(method ? { INSTRUCTION_METHOD: method } : {}),
      };

      Logger.log(
        `(SECTIONS) GET: /sections${'?' + req.url.split('?')[1] || ''}`,
      );
      return await this.SectionService.findSections(filters);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Post('/sections')
  @ApiOkResponse({ description: 'Section document was created successfully' })
  @ApiResponse({ status: 400, description: 'No sections were received' })
  @ApiOperation({
    summary: 'Used to upsert multiple section documents.',
    description:
      'Creates new section documents based on the array of sections, storing all available information for that section.',
  })
  @ApiBody({ type: [Section] })
  async postSections(@Body() sectionsArr: Section[]) {
    Logger.log('(SECTIONS) POST: /sections');
    try {
      return await this.SectionService.bulkUpsertSections(sectionsArr);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Delete('/sections/:id')
  @ApiOkResponse({
    description: 'Subject document has been deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not find a sections document with the given id',
  })
  @ApiOperation({
    summary: 'Used to delete a section document given a specific id',
    description:
      'Deletes a section document in the database for the specified id. This is mainly used for the playwright tests, so that when POST is tested, we can then delete that',
  })
  async deleteSectionByID(@Param('id') sectionID: string) {
    Logger.log(`(SECTIONS) DELETE: /sections/${sectionID}`);
    try {
      return await this.SectionService.deleteSection(sectionID);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }

  @Get('bulkSections')
  @ApiOkResponse({ description: 'List of sections was returned successfully' })
  @ApiBadRequestResponse({
    description: 'Term and crns are required query parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'No sections found given the query parameters',
  })
  @ApiOperation({
    summary: 'Used to return a the sections for a given CRN',
    description:
      'Returns static course section information. This endpoint is critical for users to find the sections for a given course. <br>All queries require the term and the crns. <br>Example: (/bulkSections?term=202510&crns=12345,67890)',
  })
  async getBulkSections(
    @Query('term') term?: string,
    @Query('crns') crns?: string,
  ) {
    if (!term || !crns) {
      throw new BadRequestException(
        'Term and crns are required query parameters',
      );
    }
    try {
      const filters: courseQueryFilters = {
        ...(term ? { TERM: term } : {}),
        ...(crns
          ? { CRN: { $in: crns.split(',').map((crn) => Number(crn)) } }
          : {}),
      };

      return await this.SectionService.findBulkSections(filters);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
