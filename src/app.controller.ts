import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { JWTAuthGuard } from './authz/local-auth.guard';
import { Auth0User, User } from './authz/user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JWTAuthGuard)
  @Get('test/user')
  getUser(@User() user: Auth0User, @Res() res: Response): void {
    res.status(HttpStatus.OK).json({ status: 'success', user: user });
  }
}
