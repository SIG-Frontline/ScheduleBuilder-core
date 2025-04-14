import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { UserSettingsService } from './userSettings.service';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('settings/')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('courses/:userId')
  @ApiOkResponse({
    description: 'Encrypted list of takenCourses was returned scucessfully',
  })
  @ApiResponse({ status: 400, description: 'Missing/invalid userId or course' })
  @ApiResponse({ status: 500, description: 'Invalid server encryption key' })
  @ApiResponse({
    status: 404,
    description: 'No settings/takenCourses found for that userId',
  })
  @ApiOperation({
    summary: 'Used to return an encrypted array of courses the user has taken',
    description:
      "Returns an encrypted array of the the courses the user has taken. This uses aes-256-gcm encryption, which should be decrypted and JSON.parse()'ed once returned",
  })
  async getPrereqs(@Param('userId') userId: string) {
    const decodedUserId = decodeURIComponent(userId);
    if (!decodedUserId) throw new BadRequestException('Missing userId!');

    return await this.userSettingsService.getTakenCourses(decodedUserId);
  }

  @Post('courses/:userId/:course')
  @ApiOkResponse({
    description: 'Course was successfully added',
  })
  @ApiResponse({ status: 400, description: 'Missing/invalid userId or course' })
  @ApiResponse({ status: 500, description: 'Invalid server encryption key' })
  @ApiOperation({
    summary: 'Used to add a prereq course to a user',
    description:
      'Adds an encrypted prereq course to the specified user. This should be encrypted with the same key before it is sent here',
  })
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
  @ApiOkResponse({
    description: 'Course was successfully removed',
  })
  @ApiResponse({ status: 400, description: 'Missing/invalid userId or course' })
  @ApiResponse({ status: 500, description: 'Invalid server encryption key' })
  @ApiOperation({
    summary: 'Used to remove a prereq course from a user',
    description:
      'Removes an encrypted prereq course to the specified user. This should be encrypted with the same key before it is sent here',
  })
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
