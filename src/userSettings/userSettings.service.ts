import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSettings } from 'schemas/userSettings.schema';
import { DataNotFoundException } from 'src/utils/types.util';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectModel(UserSettings.name)
    private userSettingsModel: Model<UserSettings>,
  ) {}

  async getTakenCourses(userId: string): Promise<string> {
    try {
      const settings = await this.userSettingsModel
        .findOne({ userId })
        .lean()
        .exec();

      if (!settings)
        throw new DataNotFoundException('No settings for the given user id');

      const takenCourses = settings.takenCourses;
      if (!takenCourses)
        throw new DataNotFoundException('No prereqs for the given user id');

      return takenCourses;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async setTakenCourses(userId: string, encryptedString: string) {
    try {
      const settings = await this.userSettingsModel
        .findOne({ userId })
        .lean()
        .exec();

      if (!settings) {
        // Creates a new document if one does not exist
        const newSettings = {
          _id: new Types.ObjectId(),
          userId,
          takenCourses: encryptedString,
        };

        await new this.userSettingsModel(newSettings).save();
      } else {
        // Saves the value
        settings.takenCourses = encryptedString;
        await this.userSettingsModel.findOneAndReplace({ userId }, settings);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
