import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Global,
} from '@nestjs/common';
import { Request } from 'express';
import { HEADERS_HANDLER } from 'src/common/util/request-param-handler.util';
import { API_KEY_VALID_ERROR } from 'src/common/util/err-handler.util';

@Global()
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[HEADERS_HANDLER.apiKeyHeader];

    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException(API_KEY_VALID_ERROR);
    }
    return true;
  }
}
