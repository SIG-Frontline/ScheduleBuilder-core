import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectInput } from 'src/utils/types.util';

@Controller('')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get('subjects/:term')
  async getSubjects(@Param('term') term: string) {
    const subjects = await this.subjectsService.findSubjects(term, 0, 20);
    return subjects;
  }

  @Get('/terms')
  async getTerms() {
    const terms = await this.subjectsService.findTerms(0, 20);
    return terms;
  }

  @Post('/subjects')
  async postSubjects(@Body() subjects: SubjectInput) {
    return this.subjectsService.createSubjects(subjects);
  }
}
