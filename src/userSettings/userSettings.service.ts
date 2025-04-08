import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSettings } from 'schemas/userSettings.schema';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
  ) {}

  async getTakenCourses(userId: string): Promise<string[]> {
    try {
      const settings = await this.userSettingsModel
        .findOne({ userId })
        .lean()
        .exec();

      if (!settings)
        throw new NotFoundException('No settings for the given user id');

      const takenCourses = settings.takenCourses;
      if (!takenCourses)
        throw new NotFoundException('No prereqs for the given user id');

      return takenCourses;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addTakenCourse(userId: string, course: string) {
    try {
      let settings = await this.userSettingsModel
        .findOne({ userId })
        .lean()
        .exec();

      // Creates a new document if one does not exist
      if (!settings) {
        const newSettings = {
          _id: new Types.ObjectId(),
          userId,
          takenCourses: [],
        };
        settings = new this.userSettingsModel(newSettings);
      }

      // Adds the course
      if (!settings.takenCourses.includes(course))
        settings.takenCourses.push(course);

      // Saves the updated value
      await this.userSettingsModel.findOneAndReplace({ userId }, settings);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async removeTakenCourse(userId: string, course: string) {
    try {
      const settings = await this.userSettingsModel
        .findOne({ userId })
        .lean()
        .exec();

      // Remove if there is a matching query, ignoring if there isn't
      if (!settings) return;
      settings.takenCourses = settings.takenCourses.filter(
        (item) => item !== course,
      );

      // Saves the updated value
      await this.userSettingsModel.findOneAndReplace({ userId }, settings);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
