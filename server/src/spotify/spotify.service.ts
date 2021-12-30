import { Injectable } from '@nestjs/common';
import * as SpotifyWebApi from 'spotify-web-api-node';

@Injectable()
export class SpotifyService {
  constructor() { }

  clientId = process.env.SPOTIFY_CLIENTID;
  clientSecret = process.env.SPOTIFY_CLIENTSECRET;

  spotifyApi = new SpotifyWebApi({
    clientId: this.clientId,
    clientSecret: this.clientSecret,
  });

  setTokens(tokens: { access_token: string, refresh_token: string }) {
    const { access_token, refresh_token } = tokens
    if (access_token) {
      this.spotifyApi.setAccessToken(access_token);
    }

    if (refresh_token) {
      this.spotifyApi.setRefreshToken(refresh_token)
    }
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
    const missingReleases = await this.getMissingReleases(newReleasesItems)
    return missingReleases
  }

  private async getMissingReleases(newReleasesItems) {
    const missingReleases = await this.getNewReleasesForUser(newReleasesItems)
    const releasesWithoutDups = this.removeDuplicate(missingReleases, "id")
    const result = await this.filterByUserPossesion(releasesWithoutDups)
    return result
  }

  private async filterByUserPossesion(data) {
    const userAlbums = await this.getMySavedAlbums()
    const savedAlbumsIds = userAlbums.body.items.map((item) => {
      return item.album.id
    })
    const result = data.filter((album) => {
      return !savedAlbumsIds.includes(album.id)
    })
    return result
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
