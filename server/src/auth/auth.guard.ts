import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { identity, Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) { }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const appToken = request?.cookies?.app
    if (!appToken) {
      throw new HttpException(
        '[AUTHGUARD]' + request.route.path.toUpperCase() + ' no token / not logged ',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.getUserInfos(appToken, request);
  }

  private async getUserInfos(token, req) {
    const userId = await this.authService.getUserIdFromToken(token)
    const userInfos = await this.usersService.findOne({ id: userId, email: "" })
    req.userInfos = userInfos
    return true
  }
}
