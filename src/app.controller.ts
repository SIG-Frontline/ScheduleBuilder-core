import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { JWTAuthGuard } from './authz/local-auth.guard';
import { Auth0User, User } from './authz/user.decorator';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/status')
  @ApiOkResponse({ description: 'The Api is running!' })
  @ApiOperation({
    summary: 'Used to return the current status of the backend',
    description: 'Returns a status code 200 if the backend is running.',
  })
  getApiStatus(): string {
    return this.appService.apiStatus();
  }

  @UseGuards(JWTAuthGuard)
  @Get('test/user')
  getUser(@User() user: Auth0User, @Res() res: Response): void {
    res.status(HttpStatus.OK).json({ status: 'success', user: user });
  }
}
