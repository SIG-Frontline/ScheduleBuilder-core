import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CourseStaticService } from './courseStatic.service';
import { CourseStatic } from 'schemas/courseStatic.schema';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('courseStatic')
export class CourseStaticController {
  constructor(private readonly courseStaticService: CourseStaticService) {}

  @Get(':courseCode')
  @ApiOkResponse({ description: 'Course static was returned successfully' })
  @ApiOperation({
    summary: 'Used to return the prerequistes for a given course',
    description: `Returns static information for a given course, most importantly its prerequisites. This endpoint is heavily used in the schedule builder course recommender feature.<br>Example courseCodes: (CS 100, Math 111)`,
  })
  @ApiResponse({
    status: 404,
    description: 'No course static found for the given courseCode.',
  })
  async getCourseStatic(@Param('courseCode') courseCode: string) {
    const decodedCourseCode = decodeURIComponent(courseCode);
    return this.courseStaticService.findCourseStatic(decodedCourseCode);
  }

  @Post('/')
  async postCourseStatic(@Body() courseStatic: CourseStatic) {
    return await this.courseStaticService.createCourseStatic(courseStatic);
  }

  @Delete('/:id')
  async deleteCourseStaticByID(@Param('id') courseStaticID: string) {
    return await this.courseStaticService.deleteCourseStatic(courseStaticID);
  }
}
