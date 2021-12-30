import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotifyModule } from './spotify/spotify.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URL),
    SpotifyModule,
    UsersModule,
    AuthModule,
    UtilsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
