import { UserPlans, UserPlansSchema } from '../../schemas/userPlans.schema';
import { UserPlansController } from './userPlans.controller';
import { UserPlansService } from './userPlans.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPlans.name, schema: UserPlansSchema },
    ]),
  ],
  controllers: [UserPlansController],
  providers: [UserPlansService],
})
export class UserPlansModule {}
