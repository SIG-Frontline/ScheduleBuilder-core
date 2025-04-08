import { Module } from '@nestjs/common';
import { UserSettingsController } from './userSettings.controller';
import { UserSettingsService } from './userSettings.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSettings, UserSettingsSchema } from 'schemas/userSettings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSettings.name, schema: UserSettingsSchema },
    ]),
  ],
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
})
export class UserSettingsModule {}
