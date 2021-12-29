import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as SpotifyWebApi from 'spotify-web-api-node';
import { SpotifyService } from 'src/spotify/spotify.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly spotifyService: SpotifyService
  ) { }

  redirectUri = process.env.SPOTIFY_CALLBACK;
  clientId = process.env.SPOTIFY_CLIENTID;
  clientSecret = process.env.SPOTIFY_CLIENTSECRET;

  scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-follow-read',
    "user-library-modify",
    "user-follow-modify"
  ];

  async login({ email, password }) {
    const user = await this.usersService.findOne({ id: "", email: email })
    if (!user) {
      throw new HttpException(
        '[AUTH/LOGIN] No user found with this email',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordTest = await new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, function (err, result) {
        if (err) {
          reject(err)
        }
        resolve(result)
      });
    })
    const emailTest = email === user.email

    if (!passwordTest || !emailTest) {
      throw new HttpException(
        '[AUTH/LOGIN] Wrong Password or Wrong Mail',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_PRIVATEKEY);

    return token
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

  async callback({ scope, state, code }) {
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
    const { access_token, refresh_token } = responseAuth.body
    this.spotifyService.setTokens({ access_token: access_token, refresh_token: refresh_token })
    return access_token;
  }

}
