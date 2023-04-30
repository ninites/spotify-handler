import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';

async function bootstrap() {
  const options: CorsOptions = {
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe,authorization',
    origin: true,
    methods: 'GET,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  const httpsOptions = {
    key: fs.readFileSync('/app/server/assets/private.key'),
    cert: fs.readFileSync('/app/server/assets/certificate.crt'),
  };

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors(options);
  app.use(cookieParser());
  await app.init();

  http.createServer(server).listen(process.env.APP_PORT);
  https.createServer(httpsOptions, server).listen(3443);
}
bootstrap();
