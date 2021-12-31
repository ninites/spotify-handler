import { Injectable } from '@nestjs/common';
import * as SpotifyWebApi from 'spotify-web-api-node';
import { UserInfos } from 'src/users/dto/create-user.dto';

@Injectable()
export class SpotifyService {
  constructor() { }

  clientId = process.env.SPOTIFY_CLIENTID;
  clientSecret = process.env.SPOTIFY_CLIENTSECRET;

  setSpotifyApi(user, { setAccess, setRefresh }) {
    const { refresh_token, access_token } = user.spotify
    const spotifyApi = new SpotifyWebApi({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    });

    if (setAccess) {
      spotifyApi.setAccessToken(access_token)
    }

    if (setRefresh) {
      spotifyApi.setRefreshToken(refresh_token)
    }

    return spotifyApi
  }

  /////// SPOTIFY API METHODS //////

  async getArtistById(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const artist = await spotifyApi.getArtist(id);
    return artist;
  }

  async addToMySavedAlbums(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const newAlbum = spotifyApi.addToMySavedAlbums([id])
    return newAlbum
  }

  async getArtistByName(name: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const artists = await spotifyApi.searchArtists(name);
    return artists;
  }

  async getMySavedAlbums(userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const albums = await spotifyApi.getMySavedAlbums();
    return albums;
  }

  async getFollowedArtists(offset: number, limit: number, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const artists = await spotifyApi.getFollowedArtists({
      limit: limit,
      offset: offset
    });
    return artists;
  }

  async getAlbumTracks(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const tracks = await spotifyApi.getAlbumTracks(id)
    return tracks
  }

  async getArtistAlbums(id: string, userInfos: UserInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
    const albums = await spotifyApi.getArtistAlbums(id, {
      offset: 0,
      include_groups: "album",
    });
    return albums;
  }


  ////// SPECIFIC APP METHODS /////

  async getAllFollowedArtists(userInfos) {
    
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })

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

      const artistsListRequest = await spotifyApi.getFollowedArtists(config)
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

  async getNewReleases(userInfos) {
    const newReleases = await this.getAllNewReleases(userInfos)
    const newReleasesItems = newReleases.body.albums.items
    const missingReleases = await this.getMissingReleases(newReleasesItems, userInfos)
    return missingReleases
  }

  private async getMissingReleases(newReleasesItems, userInfos) {
    const missingReleases = await this.getNewReleasesForUser(newReleasesItems, userInfos)
    const releasesWithoutDups = this.removeDuplicate(missingReleases, "id")
    const result = await this.filterByUserPossesion(releasesWithoutDups, userInfos)
    return result
  }

  private async filterByUserPossesion(data, userInfos: UserInfos) {
    const userAlbums = await this.getMySavedAlbums(userInfos)
    const savedAlbumsIds = userAlbums.body.items.map((item) => {
      return item.album.id
    })
    const result = data.filter((album) => {
      return !savedAlbumsIds.includes(album.id)
    })
    return result
  }

  private async getNewReleasesForUser(newReleasesItems, userInfos) {
    const userArtists = await this.getAllFollowedArtists(userInfos)
    const userArtistsNames: string[] = this.extractArtistsNames(userArtists.body.artists.items)
    return newReleasesItems.filter((item) => {
      const artistIsPresent = item.artists.map((artist) => {
        return userArtistsNames.includes(artist.name)
      })
      return artistIsPresent.includes(true)
    })
  }

  private async getAllNewReleases(userInfos) {
    const spotifyApi = this.setSpotifyApi(userInfos, { setAccess: true, setRefresh: false })
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

      const releaseResponse = await spotifyApi.getNewReleases(config)
      const releasesItems = releaseResponse.body.albums.items
      newReleaseList.body.albums.items.push(...releasesItems)

      offset += 50
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

  async getMissingsAlbums(userInfos) {
    const resp = await this.getMySavedAlbums(userInfos);
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

  async getMissingAlbumsById(id: string, userInfos) {
    const artistsAlbums = await this.getArtistAlbums(id, userInfos)
    const userAlbums = await this.getMySavedAlbums(userInfos)
    const artistsLPs = this.removeDuplicate(artistsAlbums.body.items, "name")
    const missingAlbums = artistsLPs.filter((album) => {
      const userGotAlbum = userAlbums.body.items.find((userAlbum) => {
        return userAlbum.album.name === album.name
      })
      return userGotAlbum ? false : true
    })
    return missingAlbums
  }

  private removeDuplicate(array: { [key: string]: any }[], compareValue: string): { [key: string]: any }[] {
    const result = []
    array.forEach((album) => {
      const alreadyHere = result.find((arrayKeeped) => {
        return arrayKeeped[compareValue] === album[compareValue]
      })
      if (!alreadyHere) {
        result.push(album)
      }
    })
    return result
  }

  private async getUserArtistWithAlbums(userInfos): Promise<
    { id: string; albums: { [key: string]: any } }[] | unknown[]
  > {
    const response = await this.getFollowedArtists(0, 50, userInfos);
    const userArtists = response.body.artists.items;
    const artistsWithTheirAlbums = await Promise.all(
      userArtists.map(async (artist) => {
        const artistAlbums = await this.getArtistAlbums(artist.id, userInfos);
        return {
          artist: artist,
          albums: artistAlbums.body.items,
        };
      }),
    );
    return artistsWithTheirAlbums;
  }


}
