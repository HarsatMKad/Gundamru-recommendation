import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Global,
} from '@nestjs/common';
import { Request } from 'express';
import { EErrorHandler } from '../enum/ErrHandler.enum';
import { ConfigService } from '@nestjs/config';
import { IServerConfig } from '../interface/config.interface';
import { EConfigKey } from '../enum/ConfigKey.enum';

@Global()
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly API_KEY_HEADER = 'x-api-key';
  private readonly expectedKey?: string;

  constructor(private configService: ConfigService) {
    this.expectedKey = this.configService.get<IServerConfig>(
      EConfigKey.server,
    )?.apiKey;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers[this.API_KEY_HEADER];

    if (!this.expectedKey || apiKey !== this.expectedKey) {
      throw new UnauthorizedException(EErrorHandler.API_KEY_VALID_ERROR);
    }
    return true;
  }
}
