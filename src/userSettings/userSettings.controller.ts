import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserSettingsService } from './userSettings.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JWTAuthGuard } from '../authz/local-auth.guard';
import { Auth0User, User } from '../authz/user.decorator';
@Controller('settings/')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('courses/')
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
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getPrereqs(@User() user: Auth0User) {
    const userId = user.sub;
    Logger.log(`(USER_SETTINGS) GET: /course/${userId}`);
    return await this.userSettingsService.getTakenCourses(userId);
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
  @Post('courses/:encryptedString')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async setTakenCourses(
    @User() user: Auth0User,
    @Param('encryptedString') encryptedString: string,
  ) {
    const decodedString = decodeURI(encryptedString);
    if (!decodedString)
      throw new BadRequestException('Missing encrypted string');

    const userId = user.sub;
    Logger.log(`(USER_SETTINGS) POST: /course/${userId}`);
    await this.userSettingsService.setTakenCourses(userId, decodedString);
  }
}
