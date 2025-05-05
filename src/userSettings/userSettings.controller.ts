import {
  BadRequestException,
  Controller,
  Get,
  Logger,
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

    Logger.log(`(USER_SETTINGS) GET: /course/${userId}`);
    return await this.userSettingsService.getTakenCourses(decodedUserId);
  }

  @ApiOkResponse({
    description: 'TakenCourses was successfully set',
  })
  @ApiResponse({ status: 400, description: 'Missing/invalid userId or course' })
  @ApiOperation({
    summary:
      'Used to set the takenCourses encrypted string for a specific user.',
    description:
      'Sets the takenCourses value for for a specific value. This should already be an encrypted array before being sent here.',
  })
  @Post('courses/:userId/:encryptedString')
  async setTakenCourses(
    @Param('userId') userId: string,
    @Param('encryptedString') encryptedString: string,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    if (!decodedUserId) throw new BadRequestException('Missing userId!');
    if (!encryptedString)
      throw new BadRequestException('Missing encrypted string');

    Logger.log(`(USER_SETTINGS) POST: /course/${userId}`);
    await this.userSettingsService.setTakenCourses(
      decodedUserId,
      encryptedString,
    );
  }

  async getTakenCourses(@Param('userId') userId: string) {
    const decodedUserId = decodeURIComponent(userId);
    if (!decodedUserId) throw new BadRequestException('Missing userId!');

    return await this.userSettingsService.getTakenCourses(decodedUserId);
  }
}
