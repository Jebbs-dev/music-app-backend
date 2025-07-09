import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Artist } from 'generated/prisma';
import { FetchArtistsDto } from './dto/fetch-artists.dto';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Post()
  async createArtist(@Body() artistData: Artist) {
    return this.artistService.createArtist(artistData);
  }

  @Patch(':artistId')
  async updateArtist(
    @Param('artistId') artistId: string,
    @Body() artistData: Partial<Artist>,
  ) {
    return this.artistService.updateArtist(artistId, artistData);
  }

  @Get()
  async fetchAllArtists(
    @Query()
    filters: FetchArtistsDto,
  ) {
    return this.artistService.fetchAllArtists(filters);
  }

  @Get(':artistId')
  async fetchArtistById(@Param('artistId') artistId: string) {
    return this.artistService.fetchArtistById(artistId);
  }

  @Get('artists/:artistName')
  async fetchArtistByName(@Param('artistName') artistName: string) {
    return this.artistService.fetchArtistByName(artistName);
  }
}
