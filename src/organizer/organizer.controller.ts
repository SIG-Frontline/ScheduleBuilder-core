import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { OrganizerService } from './organizer.service';
import { PlanData } from 'src/utils/types.util';

@Controller('')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Post('organizer/')
  async organizePlan(@Body() plan: PlanData) {
    if (!plan) throw new BadRequestException('No plan provided');

    return await this.organizerService.organizePlan(plan);
  }
}
