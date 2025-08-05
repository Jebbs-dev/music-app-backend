import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post(':userId/album/:albumId')
  async addAlbumToLibrary(
    @Param('userId') userId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.libraryService.addAlbumToLibrary(userId, albumId);
  }

  @Post(':userId/song/:songId')
  async addSongToLibrary(
    @Param('userId') userId: string,
    @Param('songId') songId: string,
  ) {
    return this.libraryService.addSongToLibrary(userId, songId);
  }

  @Post(':userId/:playlistId')
  async addPlaylistToLibrary(
    @Param('userId') userId: string,
    @Param('playlistId') playlistId: string,
  ) {
    return this.libraryService.addPlaylistToLibrary(userId, playlistId);
  }

  @Get('user/:userId')
  async fetchLibrary(@Param('userId') userId: string) {
    return this.libraryService.fetchLibrary(userId);
  }

  @Delete(':userId/:albumId')
  async removeAlbumFromLibrary(
    @Param('userId') userId: string,
    @Param('albumId') albumId: string,
  ) {
    return this.libraryService.removeAlbumFromLibrary(userId, albumId);
  }

  @Delete(':userId/:songId')
  async removeSongFromLibrary(
    @Param('userId') userId: string,
    @Param('songId') songId: string,
  ) {
    return this.libraryService.removeSongFromLibrary(userId, songId);
  }

  @Delete(':userId/:playlistId')
  async removePlaylistFromLibrary(
    @Body('userId') userId: string,
    @Body('playlistId') playlistId: string,
  ) {
    return this.libraryService.removePlaylistFromLibrary(userId, playlistId);
  }
}
