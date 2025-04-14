import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserSettings } from 'schemas/userSettings.schema';
import { decrypt, decryptArr, encryptArr } from 'src/utils/functions.utils';
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

  async addTakenCourse(userId: string, course: string) {
    try {
      const settings = await this.userSettingsModel
        .findOne({ userId })
        .lean()
        .exec();

      // Decrypts the incoming course
      course = decrypt(course);

      if (!settings) {
        // Creates a new document if one does not exist
        const newSettings = {
          _id: new Types.ObjectId(),
          userId,
          takenCourses: encryptArr([course]),
        };

        await new this.userSettingsModel(newSettings).save();
      } else {
        // Decrypts the courses
        const takenCourses = decryptArr(settings.takenCourses) as string[];

        // Adds the course
        if (!takenCourses.includes(course)) takenCourses.push(course);

        // Encrypts the courses again
        settings.takenCourses = encryptArr(takenCourses);

        // Saves the updated value
        await this.userSettingsModel.findOneAndReplace({ userId }, settings);
      }
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

      // Decrypts the incoming course
      course = decrypt(course);

      // Decrypts the courses
      let takenCourses = decryptArr(settings.takenCourses) as string[];

      takenCourses = takenCourses.filter((item) => item !== course);

      // Encrypts the courses again
      settings.takenCourses = encryptArr(takenCourses);

      // Saves the updated value
      await this.userSettingsModel.findOneAndReplace({ userId }, settings);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
