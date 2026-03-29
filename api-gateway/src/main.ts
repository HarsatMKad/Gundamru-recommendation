import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IServerConfig } from './common/interface/config.interface';
import { EConfigKey } from './common/enum/ConfigKey.enum';
import { ResponseInterceptor } from './common/util/responseInterceper.util';
import { AllExceptionsFilter } from './common/util/responseInterceper.util';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));

  app.useGlobalFilters(new AllExceptionsFilter());

  const configService = app.get(ConfigService);

  const port =
    configService.get<IServerConfig>(EConfigKey.server)?.port ?? 4333;

  await app.listen(port);
  console.log(`Server is running on: ${await app.getUrl()}`);
}
void bootstrap();
