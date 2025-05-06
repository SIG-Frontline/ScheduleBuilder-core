import { Body, Controller, Logger, Post } from '@nestjs/common';
import { RecommenderService } from './recommender.service';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('')
export class RecommenderController {
  constructor(private readonly recommenderService: RecommenderService) {}

  @Post('recommender/')
  @ApiOkResponse({
    description: 'Course recommendations was returned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing/invalid degree, major, year, and/or takenCourses',
  })
  @ApiOperation({
    summary: 'Used to return course recommendations to a user',
    description:
      'Returns a tree structure representing course recommendations to a user, baesd on their degree and the courses they have taken.<br>Takes in options to the body of the request, like {degree, major, year, takenCourses}',
  })
  async getRecommendation(
    @Body()
    params: {
      degree: string;
      major: string;
      year: string;
      takenCourses: string[];
    },
  ) {
    const { degree, major, year, takenCourses } = params;
    Logger.log(`(RECOMMENDER) POST: /recommender/${degree}/${major}/${year}`);

    try {
      return await this.recommenderService.getRecommendedClasses(
        degree,
        major,
        year,
        takenCourses,
      );
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
