import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserPlansService } from './userPlans.service';
import { PlanData } from 'src/utils/types.util';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JWTAuthGuard } from 'src/authz/local-auth.guard';
import { Auth0User, User } from 'src/authz/user.decorator';
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
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('userPlans')
  async getUserPlan(@User() user: Auth0User) {
    const userId = user.sub;
    const userPlans = await this.userPlansService.findPlans(userId, 0, 20);
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
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('userPlans/:uuid')
  async getSingleUserPlan(
    @User() user: Auth0User,
    @Param('uuid') uuid: string,
  ) {
    const userId = user.sub;
    const userPlan = await this.userPlansService.findPlan(userId, uuid);
    return userPlan;
  }

  @ApiOkResponse({
    description: 'User plan was created successfully',
  })
  @ApiOperation({
    summary: `Used to save a user's plan.`,
    description: `Creates a new user plan that is associated with a userID, and identified by the plan's uuid. <br>The plan data must be passed in the body of the request.`,
  })
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Post('userPlans/:uuid')
  async createUserPlan(
    @User() user: Auth0User,
    @Param('uuid') uuid: string,
    @Body() planData: PlanData,
  ) {
    const userId = user.sub;
    const userPlan = await this.userPlansService.createPlans(
      userId,
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
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Patch('userPlans/:uuid')
  async updateUserPlan(
    @User() user: Auth0User,
    @Param('uuid') uuid: string,
    @Body() planData: PlanData,
  ) {
    const userId = user.sub;
    return await this.userPlansService.updatePlan(userId, uuid, planData);
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
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Delete('userPlans/:uuid')
  async deleteUserPlan(@User() user: Auth0User, @Param('uuid') uuid: string) {
    const userId = user.sub;
    return await this.userPlansService.deletePlan(userId, uuid);
  }
}
