import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SongService } from './song.service';
import { Song } from 'generated/prisma';

@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  async createSong(@Body() songData: Song) {
    return this.songService.createSong(songData);
  }

  @Patch(':songId')
  async updateSong(
    @Param('songId') songId: string,
    @Body() songData: Partial<Song>,
  ) {
    return this.songService.updateSong(songId, songData);
  }

  @Get()
  async fetchAllSongs(
    @Param()
    filters: {
      search?: string;
      skip?: string;
      take?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.songService.fetchAllSongs(filters);
  }

  @Get(':songId')
  async fetchSongById(@Param('songId') songId: string) {
    return this.songService.fetchSongById(songId);
  }

  @Get('song/:songTitle')
  async fetchSongByTitle(@Param('songName') songTitle: string) {
    return this.songService.fetchSongByTitle(songTitle);
  }
  @Get('song/:artistId')
  async fetchSongsByArtistId(@Param('artistId') artistId: string) {
    return this.songService.fetchSongsByArtistId(artistId);
  }
  @Get('song/:albumId')
  async fetchSongsByAlbumId(@Param('albumId') albumId: string) {
    return this.songService.fetchSongsByAlbumId(albumId);
  }

  @Delete(':songId')
  async deleteSong(@Param('songId') songId: string) {
    return this.songService.deleteSong(songId);
  }
}
