import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './contexts/shared/config/envs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe())
  app.enableCors({
    origin: true, //TODO: agregar los origenes correctamente
    credentials: true
  })
  await app.listen(PORT);
}
bootstrap();
