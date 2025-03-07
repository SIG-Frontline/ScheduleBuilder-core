import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { CourseService } from './courses.service';
import { courseQueryFilters } from 'src/utils/types.util';
import { addRegexSearch } from 'src/utils/functions.utils';
@Controller('')
export class CourseController {
  constructor(private readonly CourseService: CourseService) {}

  @Get('courseSearch')
  async getCourses(
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
    @Query('page') page = 0, // Default to first page
    @Query('sectionsPerPage') sectionsPerPage = 20, // Default limit
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
        ...(honors ? { IS_HONORS: honors } : {}),
        ...(isAsync ? { IS_ASYNC: isAsync } : {}),
        ...(credits ? { CREDITS: credits } : {}),
        ...(level ? { COURSE_LEVEL: level } : {}),
        ...(summer ? { SUMMER_PERIOD: summer } : {}),
        ...(method ? { INSTRUCTION_METHOD: method } : {}),
      };

      return await this.CourseService.findCourses(
        filters,
        Number(page),
        Number(sectionsPerPage),
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('sections')
  async getSections(
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
    @Query('page') page = 0, // Default to first page
    @Query('sectionsPerPage') sectionsPerPage = 20, // Default limit
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
        ...(honors ? { IS_HONORS: honors } : {}),
        ...(isAsync ? { IS_ASYNC: isAsync } : {}),
        ...(credits ? { CREDITS: credits } : {}),
        ...(level ? { COURSE_LEVEL: level } : {}),
        ...(summer ? { SUMMER_PERIOD: summer } : {}),
        ...(method ? { INSTRUCTION_METHOD: method } : {}),
      };

      return await this.CourseService.findSections(
        filters,
        Number(page),
        Number(sectionsPerPage),
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
