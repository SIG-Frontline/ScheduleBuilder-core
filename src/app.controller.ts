import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
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
    console.log('GET: /status/');
    return this.appService.apiStatus();
  }
}
