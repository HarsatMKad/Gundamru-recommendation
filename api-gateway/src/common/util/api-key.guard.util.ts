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
import { ConfigService } from '@nestjs/config';
import { IServerConfig } from '../interface/config.interface';
import { EConfigKey } from '../enum/ConfigKey.enum';

@Global()
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[API_KEY_HEADER];

    const expectedKey = this.configService.get<IServerConfig>(
      EConfigKey.server,
    )?.internalApiKey;

    if (!expectedKey || apiKey !== expectedKey) {
      throw new UnauthorizedException(API_KEY_VALID_ERROR);
    }
    return true;
  }
}
