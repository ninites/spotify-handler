import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'get all new album depending on your prefered artists';
  }
}
