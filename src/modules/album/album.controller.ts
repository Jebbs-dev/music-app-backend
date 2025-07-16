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
import { Public } from '../../common/decorators/public.decorator';

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
  @Public()
  @Get()
  async fetchAllAlbums(@Query() filters: FetchAlbumsDto) {
    return this.albumService.fetchAllAlbums(filters);
  }

  @Public()
  @Get(':albumId')
  async fetchAlbum(@Param('albumId') albumId: string) {
    return this.albumService.fetchAlbum(albumId);
  }

  @Public()
  @Get(':artistId')
  async fetchAlbumsByArtist(@Param('artistId') artistId: string) {
    return this.albumService.fetchAlbumsByArtistId(artistId);
  }

  @Delete()
  async deleteAlbum(@Param('albumId') albumId: string) {
    return this.albumService.deleteAlbum(albumId);
  }
}
