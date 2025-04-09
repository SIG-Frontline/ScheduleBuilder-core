import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [OrganizerController],
  providers: [OrganizerService],
})
export class OrganizerModule {}
