import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthSpotifyGuard } from 'src/auth/auth-spotify.guard';
import { CreateSpotifyDto } from './dto/create-spotify.dto';
import { SpotifyErrorInterceptor } from './spotify-error.interceptor';
import { SpotifyService } from './spotify.service';
@UseGuards(AuthSpotifyGuard)
@UseInterceptors(SpotifyErrorInterceptor)
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) { }

  @Get('saved-albums')
  getMySavedAlbums(
    @Req() req
  ) {
    return this.spotifyService.getMySavedAlbums(req.userInfos);
  }

  @Post('saved-albums')
  addToMySavedAlbums(
    @Body() createDto: CreateSpotifyDto,
    @Req() req
  ) {
    const { id } = createDto
    return this.spotifyService.addToMySavedAlbums(id, req.userInfos)
  }

  @Get('followed-artists')
  async getFollowedArtists(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Req() req
  ) {
    if (!offset && !limit) {
      return await this.spotifyService.getAllFollowedArtists(req.userInfos)
    }
    return await this.spotifyService.getFollowedArtists(offset, limit, req.userInfos);
  }

  @Get('missing-albums')
  getMissingsAlbums(
    @Query('id') id: string,
    @Req() req
  ) {
    if (id) {
      return this.spotifyService.getMissingAlbumsById(id, req.userInfos)
    }
    return this.spotifyService.getMissingsAlbums(req.userInfos);
  }

  @Get('new-releases')
  getNewReleases(
    @Req() req
  ) {
    return this.spotifyService.getNewReleases(req.userInfos)
  }

  @Get('album/tracks/:id')
  getAlbumTracks(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.spotifyService.getAlbumTracks(id, req.userInfos)
  }


  @Get('artist')
  getAlbum(
    @Query('id') id: string,
    @Query('name') name: string,
    @Req() req
  ) {
    if (id) {
      return this.spotifyService.getArtistById(id, req.userInfos);
    }

    if (name) {
      return this.spotifyService.getArtistByName(name, req.userInfos);
    }
  }
}
