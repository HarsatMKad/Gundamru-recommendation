import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Global,
} from '@nestjs/common';
import { Request } from 'express';
import { API_KEY_VALID_ERROR } from '../enum/ErrHandler.enum';
import { API_KEY_HEADER } from '../const/ConstHandler.const';

@Global()
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[API_KEY_HEADER];
    const expectedKey = process.env.INTERNAL_API_KEY;

    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException(API_KEY_VALID_ERROR);
    }
    return true;
  }
}
