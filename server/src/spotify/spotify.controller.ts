import {
  Body,
  Controller,
  Get,
  Param,
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

  @Get('saved-albums')
  getMySavedAlbums() {
    return this.spotifyService.getMySavedAlbums();
  }

  @Post('saved-albums')
  addToMySavedAlbums(
    @Body() createDto: CreateSpotifyDto
  ) {
    const { id } = createDto
    return this.spotifyService.addToMySavedAlbums(id)
  }

  @Get('followed-artists')
  getFollowedArtists(
    @Query('offset') offset: number,
    @Query('limit') limit: number
  ) {
    if (!offset && !limit) {
      return this.spotifyService.getAllFollowedArtists()
    }
    return this.spotifyService.getFollowedArtists(offset, limit);
  }

  @Get('missing-albums')
  getMissingsAlbums(
    @Query('id') id: string
  ) {
    if (id) {
      return this.spotifyService.getMissingAlbumsById(id)
    }
    return this.spotifyService.getMissingsAlbums();
  }

  @Get('new-releases')
  getNewReleases() {
    return this.spotifyService.getNewReleases()
  }

  @Get('album/tracks/:id')
  getAlbumTracks(
    @Param('id') id: string
  ) {
    return this.spotifyService.getAlbumTracks(id)
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
