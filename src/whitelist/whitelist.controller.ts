import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiTokenGuard } from 'src/authz/local-auth.guard';

@Controller('whitelist')
export class WhitelistController {
  constructor(private readonly witelistService: WhitelistService) {}

  @Post('/check')
  @ApiOkResponse({
    description: 'Returns a check if the username is in the whitelist',
  })
  @ApiOperation({
    summary: 'Used to check if a user is in the whitelist',
    description: 'Returns an boolean value true if yes else returns false',
  })
  @UseGuards(ApiTokenGuard)
  async postWhitelistCheck(
    @Body('email') email: string,
  ): Promise<{ isWhitelisted: boolean }> {
    Logger.log('Processing whitelist request');
    // Add logic to check if the email is in the whitelist

    return {
      isWhitelisted: await this.witelistService.checkInWhitelist(email),
    }; // Example response
  }

  @Post('/add')
  @ApiOkResponse({
    description: 'Added user to whitelist',
  })
  @ApiOperation({
    summary: 'Add Whitelist User',
    description: 'Returns the status of adding someone to the whitelist',
  })
  @UseGuards(ApiTokenGuard)
  async postAddWhitelist(
    @Body('email') email: string,
    @Body('userId') userId: string,
  ): Promise<{ status: string }> {
    Logger.log('Processing whitelist add');
    // Add logic to check if the email is in the whitelist
    const result = await this.witelistService.addToWhitelist(email, userId);
    return {
      status: result ? 'success' : 'fail',
    };
  }
}
