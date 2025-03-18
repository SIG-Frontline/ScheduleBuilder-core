import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserPlansService } from './userPlans.service';
import { PlanData } from 'src/utils/types.util';
@Controller('')
export class UserPlansController {
  constructor(private readonly userPlansService: UserPlansService) {}

  @Get('userPlans/:userId')
  async getUserPlan(@Param('userId') userId: string) {
    const decodedUserId = decodeURIComponent(userId);
    const userPlan = await this.userPlansService.findPlans(
      decodedUserId,
      0,
      20,
    );
    return userPlan;
  }

  @Post('userPlans/:userId/:uuid')
  async createUserPlan(
    @Param('userId') userId: string,
    @Param('uuid') uuid: string,
    @Body() planData: PlanData,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    const userPlan = await this.userPlansService.createPlans(
      decodedUserId,
      uuid,
      planData,
    );
    console.log(userPlan);
    return userPlan;
  }

  @Patch('userPlans/:userId/:uuid')
  async updateUserPlan(
    @Param('userId') userId: string,
    @Param('uuid') uuid: string,
    @Body() planData: PlanData,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    return await this.userPlansService.updatePlan(
      decodedUserId,
      uuid,
      planData,
    );
  }

  @Delete('userPlans/:userId/:uuid')
  async deleteUserPlan(
    @Param('userId') userId: string,
    @Param('uuid') uuid: string,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    return await this.userPlansService.deletePlan(decodedUserId, uuid);
  }
}
