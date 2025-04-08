import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { UserSettingsService } from './userSettings.service';
@Controller('settings/')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('courses/:userId')
  async getPrereqs(@Param('userId') userId: string) {
    const decodedUserId = decodeURIComponent(userId);
    if (!decodedUserId) throw new BadRequestException('Missing userId!');

    return await this.userSettingsService.getTakenCourses(decodedUserId);
  }

  @Post('courses/:userId/:course')
  async addPrereq(
    @Param('userId') userId: string,
    @Param('course') course: string,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    if (!decodedUserId) throw new BadRequestException('Missing userId!');
    if (!course)
      throw new BadRequestException('Missing course to add to prereq');

    await this.userSettingsService.addTakenCourse(decodedUserId, course);
  }

  @Delete('courses/:userId/:course')
  async removePrereq(
    @Param('userId') userId: string,
    @Param('course') course: string,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    if (!decodedUserId) throw new BadRequestException('Missing userId!');
    if (!course)
      throw new BadRequestException('Missing course to remove from prereq');

    await this.userSettingsService.removeTakenCourse(decodedUserId, course);
  }
}
