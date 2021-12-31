import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthSpotifyGuard } from './auth/auth-spotify.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
}
