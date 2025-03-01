import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { SectionService } from './sections.service';
import { queryFilters } from 'src/utils/types.util';
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionService: SectionService) {}

  @Get('')
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
    try {
      const filters: queryFilters = {
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

      return await this.sectionService.findSections(
        filters,
        Number(page),
        Number(sectionsPerPage),
      );
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error querying database');
    }
  }
}
