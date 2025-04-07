import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserPlans, UserPlansDocument } from 'schemas/userPlans.schema';
import {
  DataNotFoundException,
  PlanData,
  UserPlanResponse,
} from 'src/utils/types.util';

@Injectable()
export class UserPlansService {
  constructor(
    @InjectModel(UserPlans.name) private userPlansModel: Model<UserPlans>,
  ) {}

  async findPlans(
    userId: string,
    sectionsPerPage: number,
    page: number,
  ): Promise<UserPlanResponse[]> {
    try {
      if (!userId) {
        throw new BadRequestException('No userID was received');
      }
      const query = { userId: userId };
      const plans = await this.userPlansModel
        .find(query)
        .limit(sectionsPerPage)
        .skip(sectionsPerPage * page)
        .lean()
        .exec();

      if (!plans) {
        throw new DataNotFoundException(
          'No plans found for that given the user id',
        );
      }

      const formattedUserPlans = plans.map((plan) => {
        return {
          userId: plan.userId,
          uuid: plan.uuid,
          planData: plan.plandata,
        };
      });

      return formattedUserPlans;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findPlan(userId: string, uuid: string): Promise<UserPlanResponse> {
    try {
      if (!userId) {
        throw new BadRequestException('No userID was received');
      }
      const query = { userId: userId, uuid: uuid };
      const plan = await this.userPlansModel.findOne(query).lean().exec();

      if (!plan) {
        throw new DataNotFoundException(
          'No plan found for that given the user id and plan uuid',
        );
      }

      const formattedUserPlan: UserPlanResponse = {
        userId: plan.userId,
        uuid: plan.uuid,
        planData: plan.plandata,
      };

      return formattedUserPlan;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createPlans(
    userId: string,
    uuid: string,
    plandata: PlanData,
  ): Promise<UserPlansDocument> {
    try {
      if (!(userId && uuid)) {
        throw new BadRequestException('No userID or uuid was received');
      }
      const userPlan = {
        _id: new Types.ObjectId(),
        userId,
        uuid,
        plandata,
      };
      const newUserPlan = new this.userPlansModel(userPlan);
      const savedPlan = await newUserPlan.save();
      return savedPlan;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updatePlan(
    userId: string,
    uuid: string,
    plandata: PlanData,
  ): Promise<UserPlansDocument | null> {
    try {
      if (!(userId && uuid)) {
        throw new BadRequestException('No userID or uuid was received');
      }
      const updatedPlan = await this.userPlansModel
        .findOneAndUpdate(
          { userId, uuid },
          { $set: { plandata } },
          { new: true, runValidators: true },
        )
        .exec();

      if (!updatedPlan) {
        throw new DataNotFoundException(
          'No plans could be found & updated for that given user id and plan uuid',
        );
      }

      return updatedPlan;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deletePlan(userId: string, uuid: string): Promise<{ message: string }> {
    try {
      if (!userId || !uuid) {
        throw new BadRequestException('UserId and UUID are required');
      }
      const deletedPlan = await this.userPlansModel
        .findOneAndDelete({ userId, uuid })
        .exec();

      if (!deletedPlan) {
        throw new DataNotFoundException(
          'No plan found for that given userId and plan uuid',
        );
      }

      return {
        message: `Plan with uuid: ${uuid} for userId: ${userId} has been deleted successfully`,
      };
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }
}
