import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = this.getStatusCode(data, context);
        const message = this.getMessage(data, statusCode);
        const cleanedData = this.cleanData(data);
        return { statusCode, message, data: cleanedData };
      }),
    );
  }

  private getStatusCode(data: T, context: ExecutionContext): number {
    const response = context.switchToHttp().getResponse();
    if (!data) {
      return 500; // Internal Server Error
    } else if (typeof data === 'object' && 'status' in data) {
      return (data as any).status;
    } else {
      return response.statusCode || 200; // Default to 200 OK
    }
  }

  private getMessage(data: T, statusCode: number): string {
    if (!data) {
      return 'Failed';
    } else if (statusCode < 300) {
      return 'Success';
    } else if (statusCode < 400) {
      return 'Redirected';
    } else if (statusCode < 500) {
      return 'Client Error';
    } else {
      return 'Server Error';
    }
  }

  private cleanData(data: T): T {
    if (Array.isArray(data)) {
      return data;
      // return data.map((item) => this.cleanObject(item)) as any;
    } else if (typeof data === 'object' && data !== null) {
      // return this.cleanObject(data); // TODO: Burası geçici olarak kapatıldı
      return data;
    }
    return data;
  }

  private cleanObject(obj: any): any {
    const cleanedObj: any = { ...obj };
    delete cleanedObj.userId;
    delete cleanedObj.id;
    delete cleanedObj.hash;
    return cleanedObj;
  }
}
