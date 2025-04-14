import { Body, Controller, Post } from '@nestjs/common';
import { RecommenderService } from './recommender.service';

@Controller('')
export class RecommenderController {
  constructor(private readonly recommenderService: RecommenderService) {}

  @Post('recommender/')
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
    const recommendedClasses =
      await this.recommenderService.getRecommendedClasses(
        degree,
        major,
        year,
        takenCourses,
      );
    return recommendedClasses;
  }
}
