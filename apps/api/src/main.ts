import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4001);
  console.log('API listening on', await app.getUrl());
}

bootstrap();
