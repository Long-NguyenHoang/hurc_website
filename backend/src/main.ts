import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', // Tiền tố URL
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.use(cookieParser());
  // --- CẤU HÌNH CORS ĐỂ CHỐNG CSRF VÀ CHO PHÉP ĐỌC COOKIE ---
  app.enableCors({
    // Chỉ cho phép các domain này được gọi API (Thay bằng domain thực tế khi lên Production)
    origin: [
      'WEB_SERVER',
      'http://192.168.1.217:3001',
      'http://127.0.0.1:3001',
    ],

    // BẮT BUỘC PHẢI LÀ TRUE: Cho phép Frontend gửi HttpOnly Cookie lên Backend
    credentials: true,

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-timezone, accept-language',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
