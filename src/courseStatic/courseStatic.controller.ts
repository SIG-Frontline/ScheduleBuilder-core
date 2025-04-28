import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CourseStaticService } from './courseStatic.service';
import { CourseStatic } from 'schemas/courseStatic.schema';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

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
  @ApiOkResponse({
    description: 'CourseStatic document was created successfully',
  })
  @ApiResponse({ status: 400, description: 'No courseStatic was received' })
  @ApiOperation({
    summary:
      'Used to upsert multiple course static documents that are sent to it',
    description:
      'Creates new course static documents based on the array of documents it receives.',
  })
  @ApiBody({ type: [CourseStatic] })
  async postCourseStatic(@Body() courseStaticArr: CourseStatic[]) {
    return await this.courseStaticService.bulkUpsertCourseStatic(
      courseStaticArr,
    );
  }

  @Delete('/:id')
  @ApiOkResponse({
    description: 'CourseStatic document has been deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not find a courseStatic document with the given id',
  })
  @ApiOperation({
    summary: 'Used to delete a course static document',
    description:
      'Deletes a course static document in the database for the specified id. This is mainly used for the playwright tests, so that when POST is tested, we can then delete that',
  })
  async deleteCourseStaticByID(@Param('id') courseStaticID: string) {
    return await this.courseStaticService.deleteCourseStatic(courseStaticID);
  }
}
