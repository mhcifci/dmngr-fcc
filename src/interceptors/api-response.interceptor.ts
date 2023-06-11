import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const response: Response<T> = {
          statusCode: this.getStatusCode(data, context),
          message: this.getMessage(data, context),
          data: data,
        };
        return response;
      }),
    );
  }

  private getStatusCode(data: T, context: ExecutionContext): number {
    const response = context.switchToHttp().getResponse();
    if (!data) {
      return 500;
    } else if (typeof data === 'object' && 'status' in data) {
      return (data as any).status;
    } else {
      return response.statusCode || 400;
    }
  }

  private getMessage(data: T, context: ExecutionContext): string {
    const response = context.switchToHttp().getResponse();
    if (!data) {
      return 'Failed';
    } else if (response.statusCode < 202) {
      return 'Success';
    } else if (response.statusCode < 400) {
      return 'Redirected';
    } else if (response.statusCode > 400) {
      return 'Failed';
    } else if (typeof data === 'object' && 'message' in data) {
      return (data as any).message;
    } else {
      return '';
    }
  }
}
