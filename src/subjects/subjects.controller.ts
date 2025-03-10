import { Controller, Get, Param } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
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
}
