import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import * as SpotifyWebApi from 'spotify-web-api-node';
import * as qs from 'qs';
import { SpotifyToken } from './spotify.interface';

@Injectable()
export class SpotifyService {
  constructor(private readonly httpService: HttpService) {}

  clientId = process.env.SPOTIFY_CLIENTID;
  clientSecret = process.env.SPOTIFY_CLIENTSECRET;
  redirectUri = process.env.SPOTIFY_CALLBACK;

  spotifyApi = new SpotifyWebApi({
    clientId: this.clientId,
    clientSecret: this.clientSecret,
    redirectUri: this.redirectUri,
  });

  scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-follow-read',
  ];
  state = 'some-state-of-my-choice';

  setAccessToken(token: string) {
    this.spotifyApi.setAccessToken(token);
  }

  login(): string {
    const authorizeURL = this.spotifyApi.createAuthorizeURL(this.scopes);
    return authorizeURL;
  }

  async callback({ scope, state, code }) {
    if (!code) {
      throw new HttpException(
        '[SPOTIFY/CALLBACK] no code ',
        HttpStatus.NOT_FOUND,
      );
    }

    const payload = {
      code: code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    };

    const stringPayload = qs.stringify(payload);

    const headers = {
      Authorization:
        'Basic ' +
        Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const token$ = this.httpService
      .post(process.env.SPOTIFY_GETTOKEN, stringPayload, {
        headers: headers,
      })
      .toPromise();

    const response: AxiosResponse = await token$;
    const data: SpotifyToken = response.data;
    const token = data.access_token;
    
    return token;
  }

  async getArtistById(id: string) {
    const artist = await this.spotifyApi.getArtist(id);
    return artist;
  }
  

  async getArtistByName(name: string) {
    const artists = await this.spotifyApi.searchArtists(name);
    return artists;
  }

  async getMySavedAlbums() {
    const albums = await this.spotifyApi.getMySavedAlbums();
    return albums;
  }

  async getFollowedArtists() {
    const artists = await this.spotifyApi.getFollowedArtists();
    return artists;
  }

  async getArtistAlbums(id: string) {
    const albums = await this.spotifyApi.getArtistAlbums(id);
    return albums;
  }

  async getMissingsAlbums() {
    const resp = await this.getMySavedAlbums();
    const userAlbums = resp.body.items;
    const userArtistWithAlbums = await this.getUserArtistWithAlbums();
    const missingAlbums = userArtistWithAlbums.map((artistAlbums) => {
      const filteredAlbums = artistAlbums.albums.filter((album) => {
        return userAlbums.some((userAlbum) => userAlbum.album.id === album.id);
      });
      
      return {
        artist: artistAlbums.artist,
        artist_missing_albums: filteredAlbums,
      };
    });
    
    return missingAlbums;
  }

  private async getUserArtistWithAlbums(): Promise<
    { id: string; albums: { [key: string]: any } }[] | unknown[]
  > {
    const response = await this.getFollowedArtists();
    const userArtists = response.body.artists.items;
    const artistsWithTheirAlbums = await Promise.all(
      userArtists.map(async (artist) => {
        const artistAlbums = await this.getArtistAlbums(artist.id);
        return {
          artist: artist,
          albums: artistAlbums.body.items,
        };
      }),
    );
    return artistsWithTheirAlbums;
  }
}
