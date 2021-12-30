import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { UsersService } from 'src/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthService } from 'src/auth/auth.service';
import { UtilsModule } from 'src/utils/utils/utils.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), UtilsModule],
  controllers: [SpotifyController],
  providers: [SpotifyService, UsersService, AuthService],
  exports: [SpotifyService]
})
export class SpotifyModule { }
