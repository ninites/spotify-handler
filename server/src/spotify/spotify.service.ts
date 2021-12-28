import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import * as SpotifyWebApi from 'spotify-web-api-node';
import * as qs from 'qs';
import { SpotifyToken } from './spotify.interface';

@Injectable()
export class SpotifyService {
  constructor(private readonly httpService: HttpService) { }

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
    "user-library-modify",
    "user-follow-modify"
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

  async getFollowedArtists(offset: number, limit: number) {
    const artists = await this.spotifyApi.getFollowedArtists({
      limit: limit,
      offset: offset
    });
    return artists;
  }

  async getAllFollowedArtists() {
    const artistsList = {
      body: {
        artists: {
          items: []
        }
      }
    }
    let fetchLoop = true
    let after = ""

    while (fetchLoop) {
      const config: any = {
        limit: 50
      }
      if (after) {
        config.after = after
      }

      const artistsListRequest = await this.spotifyApi.getFollowedArtists(config)
      const artistsItems = artistsListRequest.body.artists.items
      artistsList.body.artists.items.push(...artistsItems)
      const lastArtist = artistsItems[config.limit - 1]
      after = lastArtist ? lastArtist.id : ""

      if (!after) {
        fetchLoop = false
      }
    }

    return artistsList
  }

  async getNewReleases() {
    const newReleases = await this.getAllNewReleases()
    const newReleasesItems = newReleases.body.albums.items
    const missingReleases = await this.getNewReleasesForUser(newReleasesItems)
    return missingReleases
  }

  private async getNewReleasesForUser(newReleasesItems) {
    const userArtists = await this.getAllFollowedArtists()
    const userArtistsNames: string[] = this.extractArtistsNames(userArtists.body.artists.items)
    return newReleasesItems.filter((item) => {
      const artistIsPresent = item.artists.map((artist) => {
        return userArtistsNames.includes(artist.name)
      })
      return artistIsPresent.includes(true)
    })
  }

  private async getAllNewReleases() {
    const newReleaseList = {
      body: {
        albums: {
          items: []
        }
      }
    }
    let fetchLoop = true
    let offset = 0

    while (fetchLoop) {
      const config: any = {
        limit: 50,
        offset: offset,
        country: "FR"
      }

      const releaseResponse = await this.spotifyApi.getNewReleases(config)
      const releasesItems = releaseResponse.body.albums.items
      newReleaseList.body.albums.items.push(...releasesItems)

      offset += 20
      if (releasesItems.length === 0) {
        fetchLoop = false
      }
    }
    return newReleaseList
  }

  private extractArtistsNames(items) {
    return items.map((item) => {
      return item.name
    })
  }

  async getAlbumTracks(id: string) {
    const tracks = await this.spotifyApi.getAlbumTracks(id)
    return tracks
  }

  async getArtistAlbums(id: string) {
    const albums = await this.spotifyApi.getArtistAlbums(id, {
      offset: 0,
      include_groups: "album",
    });
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

  async getMissingAlbumsById(id: string) {
    const artistsAlbums = await this.getArtistAlbums(id)
    const userAlbums = await this.getMySavedAlbums()
    const artistsLPs = this.removeDuplicate(artistsAlbums.body.items)
    const missingAlbums = artistsLPs.filter((album) => {
      const userGotAlbum = userAlbums.body.items.find((userAlbum) => {
        return userAlbum.album.name === album.name
      })
      return userGotAlbum ? false : true
    })
    return missingAlbums
  }

  private removeDuplicate(albums: { [key: string]: any }[]): { [key: string]: any }[] {
    const result = []
    albums.forEach((album) => {
      const alreadyHere = result.find((albumKeeped) => {
        return albumKeeped.name === album.name
      })
      if (!alreadyHere) {
        result.push(album)
      }
    })
    return result
  }

  private async getUserArtistWithAlbums(): Promise<
    { id: string; albums: { [key: string]: any } }[] | unknown[]
  > {
    const response = await this.getFollowedArtists(0, 50);
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

  async addToMySavedAlbums(id: string) {
    const newAlbum = this.spotifyApi.addToMySavedAlbums([id])
    return newAlbum
  }
}
