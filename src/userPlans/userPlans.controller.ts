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
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('')
export class UserPlansController {
  constructor(private readonly userPlansService: UserPlansService) {}

  @ApiResponse({
    status: 404,
    description: 'No plans found for the given user id',
  })
  @ApiOkResponse({
    description: 'List of user plans was returned successfully',
  })
  @ApiOperation({
    summary: 'Used to return all the plans a user has saved',
    description: `Returns information for all of a user's plans. All queries require the user's userId provided by auth0.`,
  })
  @Get('userPlans/:userId')
  async getUserPlan(@Param('userId') userId: string) {
    const decodedUserId = decodeURIComponent(userId);
    const userPlans = await this.userPlansService.findPlans(
      decodedUserId,
      0,
      20,
    );
    return userPlans;
  }

  @ApiResponse({
    status: 404,
    description: 'No plans found for that given user id and plan uuid',
  })
  @ApiOkResponse({
    description: 'User plan was returned successfully',
  })
  @ApiOperation({
    summary: `Used to return a single plan a user has saved according to the plan's uuid`,
    description: `Returns a single user plan. All queries require the users userId provided by auth0 and the plan's uuid.`,
  })
  @Get('userPlans/:userId/:uuid')
  async getSingleUserPlan(
    @Param('userId') userId: string,
    @Param('uuid') uuid: string,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    const userPlan = await this.userPlansService.findPlan(decodedUserId, uuid);
    return userPlan;
  }

  @ApiOkResponse({
    description: 'User plan was created successfully',
  })
  @ApiOperation({
    summary: `Used to save a user's plan.`,
    description: `Creates a new user plan that is associated with a userID, and identified by the plan's uuid. <br>The plan data must be passed in the body of the request.`,
  })
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

  @ApiOkResponse({
    description: 'User plan was updated successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'No plans could be found & updated for that given user id and plan uuid',
  })
  @ApiOperation({
    summary: `Used to update a user's plan.`,
    description: `Updates an existing user plan that is associated with a userID, and identified by the plan's uuid. If the plan does not already exist, it will throw an error.<br>The entire plan data must be passed in the body of the request.`,
  })
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

  @ApiOkResponse({
    description: 'User plan was deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description:
      'No plans could be found & updated for that given user id and plan uuid',
  })
  @ApiOperation({
    summary: 'Used to delete a given user plan',
    description: `Deletes an exisitng user plan that is associated with a userID and identified by the plan's uuid.`,
  })
  @Delete('userPlans/:userId/:uuid')
  async deleteUserPlan(
    @Param('userId') userId: string,
    @Param('uuid') uuid: string,
  ) {
    const decodedUserId = decodeURIComponent(userId);
    return await this.userPlansService.deletePlan(decodedUserId, uuid);
  }
}
