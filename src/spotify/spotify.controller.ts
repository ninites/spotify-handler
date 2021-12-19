import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { SpotifyErrorInterceptor } from './spotify-error.interceptor';
import { SpotifyTokenInterceptor } from './spotify-token.interceptor';
import { SpotifyService } from './spotify.service';

@UseInterceptors(SpotifyTokenInterceptor)
@UseInterceptors(SpotifyErrorInterceptor)
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('login')
  // @Redirect()
  login() {
    const url = this.spotifyService.login();
    return url;
    return { url: url };
  }

  @Get('callback')
  callback(
    @Query('scope') scope,
    @Query('state') state: string,
    @Query('code') code: string,
  ) {
    return this.spotifyService.callback({
      scope: scope,
      state: state,
      code: code,
    });
  }

  @Get('user/albums')
  getMySavedAlbums() {
    return this.spotifyService.getMySavedAlbums();
  }

  @Get('user/artists')
  getFollowedArtists() {
    return this.spotifyService.getFollowedArtists();
  }

  @Get('artist')
  getAlbum(@Query('id') id: string, @Query('name') name: string) {
    if (id) {
      return this.spotifyService.getArtistById(id);
    }

    if (name) {
      return this.spotifyService.getArtistByName(name);
    }
  }
}
