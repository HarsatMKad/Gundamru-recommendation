import {
  ArgumentsHost,
  CallHandler,
  Catch,
  ExceptionFilter,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ERestStatus } from '../enum/Rest.enum';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { IApiSuccessResponse } from '../interface/apiSuccessResponse.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  IApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiSuccessResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const message = 'Запрос успешно выполнен';

        return {
          status: ERestStatus.SUCCESS,
          statusCode: response.statusCode,
          path: request.url,
          message,
          timestamp: new Date().toISOString(),
          data: data,
        };
      }),
    );
  }
}

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as
      | string
      | { message: string | string[] };

    let messages: string[] = [];
    if (typeof exceptionResponse === 'string') {
      messages = [exceptionResponse];
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse.message
    ) {
      messages = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message];
    }

    response.status(status).json({
      status: 'error',
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: exception.message,
      errors: messages,
    });
  }
}
