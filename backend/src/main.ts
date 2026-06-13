// Load .env BEFORE any module is imported, so values like JWT_SECRET are
// consistent across JwtModule.register (signing) and JwtStrategy (verifying).
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const allowed = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, cb) => {
      // Allow: non-browser tools (no origin), the explicit FRONTEND_URL
      // allowlist, any localhost port in dev, and any *.vercel.app deployment
      // (covers production + preview URLs).
      if (
        !origin ||
        allowed.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)
      ) {
        return cb(null, true);
      }
      // Reject without throwing: the browser blocks it (no ACAO header),
      // but we avoid turning it into a 500 Internal Server Error.
      return cb(null, false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 4000;
  // Bind to 0.0.0.0 so hosting platforms (Render, etc.) can detect the open port.
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`🚀 GadgetGhor API running on port ${port}`);
}
bootstrap();
