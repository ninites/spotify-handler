import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSpotifyGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
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
    await this.authService.refreshTokenCheck(req.userInfos);
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
}
