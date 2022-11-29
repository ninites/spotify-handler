import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyService } from 'src/spotify/spotify.service';
import { UserInfos } from 'src/users/dto/create-user.dto';
import { DatesService } from 'src/utils/dates/dates.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => SpotifyService))
    private readonly spotifyService: SpotifyService,
    private readonly datesService: DatesService,
  ) {}

  private readonly redirectUri = process.env.SPOTIFY_CALLBACK;
  private readonly clientId = process.env.SPOTIFY_CLIENTID;
  private readonly clientSecret = process.env.SPOTIFY_CLIENTSECRET;

  private readonly scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-follow-read',
    'user-library-modify',
    'user-follow-modify',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
  ];

  async login({ email, password }) {
    const user = await this.usersService.findOne({ id: '', email: email });

    if (!user) {
      throw new HttpException(
        '[AUTH/LOGIN] No user found with this email',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordTest = await new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
    const emailTest = email === user.email;

    if (!passwordTest || !emailTest) {
      throw new HttpException(
        '[AUTH/LOGIN] Wrong Password or Wrong Mail',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_PRIVATEKEY);

    return token;
  }

  spotifyLogin(): string {
    const spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    });

    const authorizeURL = spotifyApi.createAuthorizeURL(this.scopes);
    return authorizeURL;
  }

  async callback({ scope, state, code, appToken }) {
    if (!code) {
      throw new HttpException(
        '[SPOTIFY/CALLBACK] no code ',
        HttpStatus.NOT_FOUND,
      );
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    });

    const responseAuth = await spotifyApi.authorizationCodeGrant(code);

    const { access_token, refresh_token, expires_in } = responseAuth.body;

    const infosForUserAccountBinding = {
      spotify: {
        spotifyApi: spotifyApi,
        access_token: access_token,
        refresh_token: refresh_token,
        access_token_expires_in: expires_in,
      },
      app: {
        app_token: appToken,
      },
    };

    // BIND APP ACCOUNT AND SPOTIFY ACCOUNT
    await this.bindAppAccounts(infosForUserAccountBinding);

    return {
      name: 'spotify',
      content: 'true',
      expires: expires_in * 1000,
    };
  }

  private async bindAppAccounts({ spotify, app }) {
    const { access_token, refresh_token, spotifyApi, access_token_expires_in } =
      spotify;
    const { app_token } = app;

    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);

    const spotifyAccount = await spotifyApi.getMe();

    const userId = this.getUserIdFromToken(app_token);

    const userInfos = {
      spotify: {
        spotify_id: spotifyAccount.body.id,
        email: spotifyAccount.body.email,
        access_token: access_token,
        refresh_token: refresh_token,
        access_token_expires_in: access_token_expires_in,
        access_token_created: new Date(),
      },
    };

    const binded = await this.usersService.update(userId, userInfos);

    return;
  }

  async refreshTokenCheck(userInfos: UserInfos) {
    const { access_token_created, access_token_expires_in } = userInfos.spotify;

    const elapsedTime = this.datesService.fromNow(
      access_token_created,
      'seconds',
    );

    const timeLeft = access_token_expires_in - elapsedTime;
    const minTimeBeforeRefresh = parseInt(
      process.env.SPOTIFY_REFRESH_TOKEN_MIN,
    );

    let user = userInfos;

    if (timeLeft < minTimeBeforeRefresh) {
      const newToken = await this.refreshToken(userInfos);
      user = await this.usersService.update(userInfos._id, {
        spotify: { access_token: newToken, access_token_created: new Date() },
      });
    }

    return user;
  }

  private async refreshSpotifyToken(userInfos: UserInfos): Promise<string> {
    const spotifyApi = this.spotifyService.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: true,
    });
    const newTokenResponse = await spotifyApi.refreshAccessToken();
    const { access_token } = newTokenResponse.body;
    return access_token;
  }

  private async refreshToken(userInfos) {
    const newToken = await this.refreshSpotifyToken(userInfos);
    return newToken;
  }

  getUserIdFromToken(token: string): string {
    const verification = jwt.verify(token, process.env.JWT_PRIVATEKEY);
    const userId = verification.id || '';
    return userId;
  }
}
