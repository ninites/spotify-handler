import { Injectable } from '@nestjs/common';
import * as SpotifyWebApi from 'spotify-web-api-node';
import { AuthService } from 'src/auth/auth.service';
import { UserInfos, UserRelease } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/utils/mail/mail.service';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DatesService } from 'src/utils/dates/dates.service';

@Injectable()
export class SpotifyService {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly datesService: DatesService,
  ) {}

  private readonly clientId = process.env.SPOTIFY_CLIENTID;
  private readonly clientSecret = process.env.SPOTIFY_CLIENTSECRET;

  private readonly newReleaseMonthRange = 1;

  setSpotifyApi(user, { setAccess, setRefresh }) {
    const { refresh_token, access_token } = user.spotify;
    const spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });

    if (setAccess) {
      spotifyApi.setAccessToken(access_token);
    }

    if (setRefresh) {
      spotifyApi.setRefreshToken(refresh_token);
    }

    return spotifyApi;
  }

  /////// SPOTIFY API METHODS //////

  async getMe(userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const me = await spotifyApi.getMe();
    return me;
  }

  async getArtistById(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const artist = await spotifyApi.getArtist(id);
    return artist;
  }

  async addToMySavedAlbums(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const newAlbum = await spotifyApi.addToMySavedAlbums([id]);

    // REMOVE FROM NEW RELEASES APP DB
    await this.userService.removeRelease(userInfos._id, id);

    return newAlbum;
  }

  async getArtistByName(name: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const artists = await spotifyApi.searchArtists(name);
    return artists;
  }

  async getMySavedAlbums(userInfos: UserInfos, config) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const albums = await spotifyApi.getMySavedAlbums(config);
    return albums;
  }

  async getFollowedArtists(
    offset: number,
    limit: number,
    userInfos: UserInfos,
  ) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const artists = await spotifyApi.getFollowedArtists({
      limit: limit,
      offset: offset,
    });
    return artists;
  }

  async getAlbumTracks(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const tracks = await spotifyApi.getAlbumTracks(id);
    return tracks;
  }

  async getArtistAlbums(id: string, userInfos: UserInfos, config?) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });

    const configuration = {
      offset: 0,
      limit: 50,
      include_groups: 'album',
      ...config,
    };

    const albums = await spotifyApi.getArtistAlbums(id, configuration);

    return albums;
  }

  async getPlaylists(userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const { spotify } = userInfos;
    const userId = spotify.spotify_id;
    const response = await spotifyApi.getUserPlaylists(userId);
    return response.body.items;
  }

  async getPlaylistById(userInfos: UserInfos, playlistId: string) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const response = await spotifyApi.getPlaylist(playlistId);
    return response.body;
  }

  async getPlaylistAndTracksByPlaylistId(
    userInfos: UserInfos,
    playlistId: string,
  ) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });

    let stopCondition = false;
    let tracks = [];
    let turns = 0;
    const config = {
      offset: 0,
      limit: 50,
      fields: 'items',
    };

    try {
      do {
        const response = await spotifyApi.getPlaylistTracks(playlistId, config);
        config.offset += config.limit;
        const { items } = response.body;
        const tracksIds = items.map((item) => item.track.id);
        const lovedResponse = await spotifyApi.containsMySavedTracks(tracksIds);
        const tracksAdded = [];
        items.forEach((item, index) => {
          const result = { track: item, loved: lovedResponse.body[index] };
          tracksAdded.push(result);
        });

        tracks = [...tracks, ...tracksAdded];
        if (items.length < config.limit) {
          stopCondition = true;
        }
        turns += 1;
      } while (!stopCondition && turns < 20);

      const albumSorted = {};
      for (const track of tracks) {
        const { id } = track.track.track.album;
        if (!albumSorted[id]) {
          albumSorted[id] = [];
        }
        albumSorted[id].push(track);
      }

      return albumSorted;
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      const err = new Error();
      err.stack = error;
      err.message = error.message;
      throw err;
    }
  }

  async deletePlaylistTracks(
    userInfos: UserInfos,
    playlistId: string,
    tracksURIs: string[],
  ) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });

    try {
      const { snapshot_id } = await this.getPlaylistById(userInfos, playlistId);
      const options = {
        snapshot_id: snapshot_id,
      };
      const result = await spotifyApi.removeTracksFromPlaylist(
        playlistId,
        tracksURIs,
        options,
      );
      console.log('====================================');
      console.log(result.statusCode);
      console.log('====================================');
      return result;
    } catch (error) {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      const err = new Error();
      err.stack = error;
      err.message = error.message;
      throw err;
    }
  }

  ////// SPECIFIC APP METHODS /////

  async getSpotifyUserInfos(userInfos: UserInfos) {
    return this.getMe(userInfos);
  }

  @Cron(CronExpression.EVERY_WEEKEND, { name: 'new-releases' })
  async getNewReleasesCron() {
    console.log('[CRON/GET NEW RELEASES] START');

    // PREVENT CRON LOADING TWICE
    const job = this.schedulerRegistry.getCronJob('new-releases');
    job.stop();

    const users = await this.userService.findAll();

    // REFRESH TOKEN IF NEEDED
    const refreshedUsers = await Promise.all(
      users.map(async (user: UserInfos) => {
        return await this.authService.refreshTokenCheck(user);
      }),
    );
    console.log('missing releases start');

    // GET MISSINGS NEW RELEASES
    const usersMissingAlbums = await Promise.all(
      refreshedUsers.map(async (user: UserInfos) => {
        const missingReleases = await this.getNewReleases(user);

        return {
          infos: user,
          missing_releases: missingReleases,
        };
      }),
    );
    console.log('missing releases end');
    // REPLACE THEM IN APP DB
    const result = await Promise.all(
      usersMissingAlbums.map(async (user) => {
        await this.userService.changeReleases(
          user.infos._id,
          user.missing_releases,
        );
        return {
          infos: user.infos,
          releases: user.missing_releases,
        };
      }),
    );

    // SEND MAIL
    await Promise.all(
      result.map(async (user) => {
        if (user.releases.length === 0) {
          return;
        }
        return await this.mailService.sendNewReleases(
          user.infos,
          user.releases,
        );
      }),
    );

    // PREVENT CRON LOADING TWICE
    job.start();

    console.log('[CRON/GET NEW RELEASES] DONE ');
    return true;
  }

  async getNewReleasesByUser(userInfos: UserInfos) {
    const user = await this.userService.findOne({
      id: userInfos._id,
      email: '',
    });

    return user.spotify.releases;
  }

  private async getNewReleases(userInfos: UserInfos): Promise<UserRelease[]> {
    const newReleases = await this.getAllNewReleases(userInfos);
    const newReleasesItems = newReleases.body.albums.items;
    const missingReleases = await this.getMissingReleases(
      newReleasesItems,
      userInfos,
    );
    return missingReleases;
  }

  private async getMissingReleases(
    newReleasesItems,
    userInfos: UserInfos,
  ): Promise<UserRelease[]> {
    const missingReleases = await this.getNewReleasesForUser(
      newReleasesItems,
      userInfos,
    );
    const releasesWithoutDups = this.removeDuplicate(missingReleases, 'name');
    const result = await this.filterByUserPossesion(
      releasesWithoutDups,
      userInfos,
    );

    return result;
  }

  private async filterByUserPossesion(data, userInfos: UserInfos) {
    const userAlbums = await this.getAllMySavedAlbums(userInfos);
    const savedAlbumsIds = userAlbums.body.items.map((item) => {
      return item.album.id;
    });
    const result = data.filter((album) => {
      return !savedAlbumsIds.includes(album.id);
    });
    return result;
  }

  private async getNewReleasesForUser(
    newReleasesItems,
    userInfos: UserInfos,
  ): Promise<UserRelease[]> {
    const userArtists = await this.getAllFollowedArtists(userInfos);
    const userArtistsNames: string[] = this.extractArtistsInfos(
      userArtists.body.artists.items,
      'name',
    );

    const userArtistsIds = this.extractArtistsInfos(
      userArtists.body.artists.items,
      'id',
    );

    // const silentNewReleases = await this.getSilentReleases(
    //   userArtistsIds,
    //   userInfos,
    // );

    const silentNewReleases = [];

    const newReleases = newReleasesItems.filter((item) => {
      const artistIsPresent = item.artists.map((artist) => {
        return userArtistsNames.includes(artist.name);
      });
      return artistIsPresent.includes(true);
    });

    const result = [...newReleases, ...silentNewReleases];

    return result;
  }

  private async getSilentReleases(artistsIds: string[], userInfos: UserInfos) {
    const list = await Promise.all(
      artistsIds.map(async (id: string) => {
        const artistAlbumsResponse = await this.getArtistAlbums(id, userInfos);
        const artistAlbums = artistAlbumsResponse.body.items;
        const newHiddenReleases = artistAlbums.filter((album) => {
          const isInDatesRange = this.datesService.isInRange(
            album.release_date,
            this.newReleaseMonthRange,
          );
          return isInDatesRange;
        });
        return newHiddenReleases;
      }),
    );
    const result = list.flat();
    return result;
  }

  private async getAllNewReleases(userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });
    const newReleaseList = {
      body: {
        albums: {
          items: [],
        },
      },
    };
    let fetchLoop = true;
    let offset = 0;

    while (fetchLoop) {
      const config: any = {
        limit: 50,
        offset: offset,
        country: 'FR',
      };

      const releaseResponse = await spotifyApi.getNewReleases(config);
      const releasesItems = releaseResponse.body.albums.items;
      newReleaseList.body.albums.items.push(...releasesItems);

      offset += 50;
      if (releasesItems.length === 0) {
        fetchLoop = false;
      }
    }
    return newReleaseList;
  }

  private async getAllMySavedAlbums(userInfos: UserInfos) {
    return await this.getAllAlbums(userInfos, 'saved');
  }

  private async getAllArtistAlbums(id: string, userInfos: UserInfos) {
    return await this.getAllAlbums(userInfos, 'artist', id);
  }

  private async getAllAlbums(
    userInfos: UserInfos,
    type: 'saved' | 'artist',
    artistId?: string,
  ) {
    const albumList = {
      body: {
        items: [],
      },
    };
    let fetchLoop = true;
    let offset = 0;

    while (fetchLoop) {
      const config: any = {
        limit: 50,
        offset: offset,
      };

      let albumsResponse;

      switch (type) {
        case 'saved':
          albumsResponse = await this.getMySavedAlbums(userInfos, config);
          break;
        case 'artist':
          albumsResponse = await this.getArtistAlbums(
            artistId,
            userInfos,
            config,
          );
          break;
        default:
          break;
      }

      const albumsItems = albumsResponse.body.items;
      albumList.body.items.push(...albumsItems);

      offset += 50;
      if (albumsItems.length === 0) {
        fetchLoop = false;
      }
    }
    return albumList;
  }

  async getAllFollowedArtists(userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, {
      setAccess: true,
      setRefresh: false,
    });

    const artistsList = {
      body: {
        artists: {
          items: [],
        },
      },
    };
    let fetchLoop = true;
    let after = '';

    while (fetchLoop) {
      const config: any = {
        limit: 50,
      };
      if (after) {
        config.after = after;
      }

      const artistsListRequest = await spotifyApi.getFollowedArtists(config);
      const artistsItems = artistsListRequest.body.artists.items;
      artistsList.body.artists.items.push(...artistsItems);
      const lastArtist = artistsItems[config.limit - 1];
      after = lastArtist ? lastArtist.id : '';

      if (!after) {
        fetchLoop = false;
      }
    }

    return artistsList;
  }

  private extractArtistsInfos(items, type: string) {
    return items.map((item) => {
      return item[type];
    });
  }

  /**
   * DEPRECATED NEED REFACTO
   * @param userInfos
   * @returns
   */
  async getMissingsAlbums(userInfos: UserInfos) {
    const resp = await this.getAllMySavedAlbums(userInfos);
    const userAlbums = resp.body.items;
    const userArtistWithAlbums = await this.getUserArtistWithAlbums(userInfos);
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

  async getMissingAlbumsById(id: string, userInfos: UserInfos) {
    const artistsAlbums = await this.getAllArtistAlbums(id, userInfos);
    const userAlbums = await this.getAllMySavedAlbums(userInfos);
    const missingAlbums = artistsAlbums.body.items.filter((album) => {
      const userGotAlbum = userAlbums.body.items.find((userAlbum) => {
        const result = userAlbum.album.name === album.name;
        return result;
      });

      return userGotAlbum ? false : true;
    });
    const result = this.removeDuplicate(missingAlbums, 'name');
    return result;
  }

  private removeDuplicate(
    array: { [key: string]: any }[],
    compareValue: string,
  ): { [key: string]: any }[] {
    const result = [];
    array.forEach((album) => {
      const alreadyHere = result.find((arrayKeeped) => {
        return arrayKeeped[compareValue] === album[compareValue];
      });
      if (!alreadyHere) {
        result.push(album);
      }
    });
    return result;
  }

  private async getUserArtistWithAlbums(
    userInfos: UserInfos,
  ): Promise<{ id: string; albums: { [key: string]: any } }[] | unknown[]> {
    const response = await this.getFollowedArtists(0, 50, userInfos);
    const userArtists = response.body.artists.items;
    const artistsWithTheirAlbums = await Promise.all(
      userArtists.map(async (artist) => {
        const artistAlbums = await this.getAllArtistAlbums(
          artist.id,
          userInfos,
        );
        return {
          artist: artist,
          albums: artistAlbums.body.items,
        };
      }),
    );
    return artistsWithTheirAlbums;
  }
}
