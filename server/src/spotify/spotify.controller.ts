import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CreateSpotifyDto } from './dto/create-spotify.dto';
import { SpotifyErrorInterceptor } from './spotify-error.interceptor';
import { SpotifyTokenInterceptor } from './spotify-token.interceptor';
import { SpotifyService } from './spotify.service';

@UseInterceptors(SpotifyTokenInterceptor)
@UseInterceptors(SpotifyErrorInterceptor)
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) { }

  @Get('login')
  // @Redirect()
  login() {
    const url = this.spotifyService.login();
    return url
    // return { url: url };
  }

  @Get('callback')
  async callback(
    @Query('scope') scope,
    @Query('state') state: string,
    @Query('code') code: string,
    @Res({ passthrough: true }) res,
  ) {
    const token = await this.spotifyService.callback({
      scope: scope,
      state: state,
      code: code,
    });
    res.cookie('spotify', token);
    res.redirect(302, process.env.FRONT_REDIRECT_URI)
  }

  @Get('user/albums')
  getMySavedAlbums() {
    return this.spotifyService.getMySavedAlbums();
  }

  @Post('user/albums')
  addToMySavedAlbums(
    @Body() createDto: CreateSpotifyDto
  ) {
    const { id } = createDto
    return this.spotifyService.addToMySavedAlbums(id)
  }

  @Get('user/artists')
  getFollowedArtists() {
    return this.spotifyService.getFollowedArtists();
  }

  @Get('user/missing-album')
  getMissingsAlbums(
    @Query('id') id: string
  ) {
    if (id) {
      return this.spotifyService.getMissingAlbumsById(id)
    }
    return this.spotifyService.getMissingsAlbums();
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
