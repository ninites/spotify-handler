import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserInfos } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { DatesService } from 'src/utils/dates/dates.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSpotifyGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly datesService: DatesService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const appToken = request?.cookies?.app;

    if (!appToken) {
      throw new HttpException(
        '[AUTHGUARD]' +
          request.route.path.toUpperCase() +
          ' no app token / not logged ',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.handleUser(appToken, request);
  }

  private async handleUser(token, req) {
    // SURCHARGE REQ WITH USER INFOS //
    req.userInfos = await this.getUserInfos(token);
    // CHECK IF NEED TO REFRESH TOKEN //
    await this.refreshTokenCheck(req.userInfos);
    return true;
  }

  private async getUserInfos(token) {
    const userId = await this.authService.getUserIdFromToken(token);
    const userInfos = await this.usersService.findOne({
      id: userId,
      email: '',
    });
    return userInfos;
  }

  private async refreshTokenCheck(userInfos: UserInfos) {
    const { access_token_created, access_token_expires_in, refresh_token } =
      userInfos.spotify;

    const elapsedTime = this.datesService.fromNow(
      access_token_created,
      'seconds',
    );

    const timeLeft = access_token_expires_in - elapsedTime;
    const minTimeBeforeRefresh = parseInt(
      process.env.SPOTIFY_REFRESH_TOKEN_MIN,
    );

    // if (timeLeft < minTimeBeforeRefresh) {
    const newToken = await this.refreshToken(userInfos);
    const updatedUser = await this.usersService.update(userInfos._id, {
      spotify: { access_token: newToken, access_token_created: new Date() },
    });
    
    // }
  }

  private async refreshToken(userInfos) {
    const newToken = await this.authService.refreshSpotifyToken(userInfos);
    return newToken;
  }
}
