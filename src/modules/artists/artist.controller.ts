import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { Artist } from 'generated/prisma';
import { FetchArtistsDto } from './dto/fetch-artists.dto';
import { Public } from '../../common/decorators/public.decorator';
import { hashPassword } from '../auth/utils/compare-password';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Public()
  @Post()
  async createArtist(@Body() artistData: Artist) {
    const password = hashPassword(artistData.password);

    return this.artistService.createArtist({ ...artistData, password });
  }

  @Patch(':artistId')
  @UseGuards(RolesGuard)
  @Roles('ARTIST')
  async updateArtist(
    @Param('artistId') artistId: string,
    @Body() artistData: Partial<Artist>,
  ) {
    return this.artistService.updateArtist(artistId, artistData);
  }

  @Public()
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

  @Get(':artistName')
  async fetchArtistByName(@Param('artistName') artistName: string) {
    return this.artistService.fetchArtistByName(artistName);
  }
}
