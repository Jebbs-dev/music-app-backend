import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AlbumService } from './album.service';
import { FetchAlbumsDto } from './dto/fetch-albums.dto';
import { Album } from 'generated/prisma';

@Controller('albums')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Post()
  async createAlbum(@Body() albumData: Album) {
    return this.albumService.createAlbum(albumData);
  }

  @Patch(':albumId')
  async updateAlbum(
    @Param('albumId') albumId: string,
    @Body() albumData: Partial<Album>,
  ) {
    return this.albumService.updateAlbum(albumId, albumData);
  }

  @Get()
  async fetchAllAlbums(@Query() filters: FetchAlbumsDto) {
    return this.albumService.fetchAllAlbums(filters);
  }

  @Delete()
  async deleteAlbum(@Param('albumId') albumId: string) {
    return this.albumService.deleteAlbum(albumId);
  }
}
