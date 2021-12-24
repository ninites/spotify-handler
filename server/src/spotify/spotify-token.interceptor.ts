import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SpotifyService } from './spotify.service';

@Injectable()
export class SpotifyTokenInterceptor implements NestInterceptor {
  constructor(private readonly spotifyService: SpotifyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    let token = '';
    const authorization = context.switchToHttp().getRequest().headers[
      'authorization'
    ];
    if (authorization) {
      token = authorization.split('Bearer ')[1];
      this.spotifyService.setAccessToken(token);
    }

    return next.handle();
  }
}
