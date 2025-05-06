import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserWhitelist } from 'schemas/userWhitelist';

@Injectable()
export class WhitelistService {
  constructor(
    @InjectModel(UserWhitelist.name)
    private userWhitelistModel: Model<UserWhitelist>,
  ) {}

  async checkInWhitelist(email: string): Promise<boolean> {
    try {
      const hits = await this.userWhitelistModel
        .findOne({ email: email })
        .lean()
        .exec();

      return !!hits?.email;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addToWhitelist(email: string, userId: string): Promise<boolean> {
    try {
      const added = await this.userWhitelistModel.insertOne({
        email: email,
        userId: userId,
      });

      return !!added;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
