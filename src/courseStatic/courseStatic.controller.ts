import { Controller, Get, Param } from '@nestjs/common';
import { CourseStaticService } from './courseStatic.service';

@Controller('courseStatic')
export class CourseStaticController {
  constructor(private readonly courseStaticService: CourseStaticService) {}

  @Get(':id')
  async getCourseStatic(@Param('id') id: string) {
    const decodedID = decodeURIComponent(id);
    return this.courseStaticService.findCourseStatic(decodedID);
  }
}
