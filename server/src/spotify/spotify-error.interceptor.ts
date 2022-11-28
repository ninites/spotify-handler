import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class SpotifyErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const errorComingFrom = context.getArgByIndex(0).route.path;
    const errorBracket = `[${errorComingFrom.toUpperCase()}] `;

    return next.handle().pipe(
      catchError((err) => {
        console.log(err);
        
        const status = this.getStatus(err.statusCode);
        throw new HttpException(errorBracket + err.message, status);
      }),
    );
  }

  private getStatus(code: number) {
    let result;
    switch (code) {
      case 404:
        result = HttpStatus.NOT_FOUND;
        break;
      case 400:
        result = HttpStatus.BAD_REQUEST;
        break;
      case 401:
        result = HttpStatus.UNAUTHORIZED;
        break;
      default:
        result = HttpStatus.INTERNAL_SERVER_ERROR;
        break;
    }
    return result;
  }
}
