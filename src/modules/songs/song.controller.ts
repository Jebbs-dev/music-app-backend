import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SongService } from './song.service';
import { Song } from 'generated/prisma';
import { FetchSongsDto } from './dto/fetch-songs.dto';
import { Public } from '../../common/decorators/public.decorator';

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

  @Public()
  @Get()
  async fetchAllSongs(
    @Query()
    filters: FetchSongsDto,
  ) {
    return this.songService.fetchAllSongs(filters);
  }

  @Get(':songId')
  async fetchSongById(@Param('songId') songId: string) {
    return this.songService.fetchSongById(songId);
  }

  @Get(':songTitle')
  async fetchSongByTitle(@Param('songName') songTitle: string) {
    return this.songService.fetchSongByTitle(songTitle);
  }
  @Get(':artistId')
  async fetchSongsByArtist(@Param('artistId') artistId: string) {
    return this.songService.fetchSongsByArtistId(artistId);
  }
  @Get(':albumId')
  async fetchSongsByAlbum(@Param('albumId') albumId: string) {
    return this.songService.fetchSongsByAlbumId(albumId);
  }

  @Delete(':songId')
  async deleteSong(@Param('songId') songId: string) {
    return this.songService.deleteSong(songId);
  }
}
