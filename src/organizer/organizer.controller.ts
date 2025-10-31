import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
} from '@nestjs/common';
import { OrganizerService } from './organizer.service';
import { PlanData } from '../utils/types.util';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Post('organizer/')
  @ApiOkResponse({
    description: 'Organized plan was returned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No plan/courses selected',
  })
  @ApiResponse({
    status: 404,
    description: 'No valid schedules could be made',
  })
  @ApiOperation({
    summary: 'Used to return an optimized plan to a user',
    description:
      "Returns an optimized plan based on the input plan and the user's selected filters/options<br>The entire plan must be passed in the body of the request",
  })
  async organizePlan(@Body() plan: PlanData) {
    if (!plan) throw new BadRequestException('No plan provided');

    Logger.log('(ORGANIZER) POST: /organizer/');
    try {
      return await this.organizerService.organizePlan(plan);
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
