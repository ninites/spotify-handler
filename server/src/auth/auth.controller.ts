import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Query,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res,
  ) {
    const infos = {
      email: email || '',
      password: password || '',
    };
    const token = await this.authService.login(infos);
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    res.cookie('app', token);
  }

  @Get('/spotify/login')
  spotifyLogin() {
    const url = this.authService.spotifyLogin();
    return url;
  }

  @Get('/spotify/callback')
  async callback(
    @Query('scope') scope,
    @Query('state') state: string,
    @Query('code') code: string,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const appToken = req?.cookies?.app;

    if (!appToken) {
      throw new HttpException(
        '[SPOTIFY/CALLBACK] no app token / not logged ',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = await this.authService.callback({
      scope: scope,
      state: state,
      code: code,
      appToken: appToken,
    });

    res.cookie(token.name, token.content, { maxAge: token.expires });
    res.redirect(302, process.env.FRONT_REDIRECT_URI);
  }
}
