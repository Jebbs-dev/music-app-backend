import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post('create')
  async createPlaylist(@Body() data: CreatePlaylistDto) {
    return this.playlistService.createPlaylist(data);
  }

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post(':playlistId/songs/:songId')
  async addSongToPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string,
  ) {
    return this.playlistService.addSongToPlaylist(playlistId, songId);
  }

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Post(':playlistId/albums/:albumId')
  async addAlbumToPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.playlistService.addAlbumToPlaylist(playlistId, albumId);
  }

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Get('user/:userId')
  async getPlaylists(@Param('userId') userId: string) {
    return this.playlistService.getPlaylists(userId);
  }

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete(':playlistId/songs/:songId')
  async removeSongFromPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string,
  ) {
    return this.playlistService.removeSongFromPlaylist(playlistId, songId);
  }

  @UseGuards(RolesGuard)
  @Roles('USER')
  @Delete(':playlistId/albums/:albumId')
  async removeAlbumFromPlaylist(
    @Param('playlistId') playlistId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.playlistService.removeAlbumFromPlaylist(playlistId, albumId);
  }
}
