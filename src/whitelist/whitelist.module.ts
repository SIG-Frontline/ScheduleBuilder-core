import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserWhitelist,
  UserWhitelistSchema,
} from '../../schemas/userWhitelist';
import { WhitelistService } from './whitelist.service';
import { WhitelistController } from './whitelist.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserWhitelist.name, schema: UserWhitelistSchema },
    ]),
  ],
  controllers: [WhitelistController],
  providers: [WhitelistService],
})
export class WhitelistModule {}
