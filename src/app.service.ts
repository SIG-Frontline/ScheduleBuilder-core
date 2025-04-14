import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  apiStatus(): string {
    return 'The Api is running!';
  }
}
