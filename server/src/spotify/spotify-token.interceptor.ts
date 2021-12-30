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
  constructor(private readonly spotifyService: SpotifyService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    let tokens = '';
    const authorization = context.switchToHttp().getRequest().headers[
      'authorization'
    ];
    let spotifyToken = ""
    if (authorization) {
      tokens = authorization.split('Bearer ')[1];

      if (tokens) {
        spotifyToken = JSON.parse(tokens).spotify
      }

      this.spotifyService.setTokens({ access_token: spotifyToken, refresh_token: "" });
    }

    return next.handle();
  }
}
