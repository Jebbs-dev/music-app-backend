import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Artist } from 'generated/prisma';
import { FetchArtistsDto } from './dto/fetch-artists.dto';

@Injectable()
export class ArtistService {
  constructor(private prisma: PrismaService) {}

  async createArtist(data: Artist): Promise<Artist> {
    return this.prisma.artist.create({
      data,
    });
  }

  async updateArtist(artistId: string, data: Partial<Artist>): Promise<Artist> {
    return this.prisma.artist.update({
      where: {
        id: artistId,
      },
      data,
    });
  }

  async fetchArtistByEmail(email: string): Promise<Artist | null> {
    const artist = await this.prisma.artist.findUnique({
      where: { email },
    });

    return artist;
  }

  async fetchAllArtists(filters: FetchArtistsDto): Promise<{
    artists: Artist[];
    next: boolean;
    previous: boolean;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, skip, take, sortBy, sortOrder, startDate, endDate } =
      filters;

    try {
      const where: Prisma.ArtistWhereInput = {};

      if (search) {
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
      }

      let startDateObj: Date | undefined;
      let endDateObj: Date | undefined;

      if (startDate) {
        startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          throw new Error('Invalid startDate format');
        }
      }

      if (endDate) {
        endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          throw new Error('Invalid endDate format');
        }
      }

      if (startDateObj || endDateObj) {
        where.createdAt = {
          ...(startDateObj && { gte: startDateObj }),
          ...(endDateObj && { lte: endDateObj }),
        };
      }

      const skipNumber = Math.max(0, skip ? parseInt(skip, 10) || 0 : 0);
      const takeNumber = Math.min(
        100,
        Math.max(1, take ? parseInt(take, 10) || 10 : 10),
      );

      const orderField = sortBy ?? 'createdAt';
      const orderDirection =
        (sortOrder ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

      const [artists, total] = await this.prisma.$transaction([
        this.prisma.artist.findMany({
          where,
          skip: skipNumber,
          take: takeNumber,
          orderBy: {
            [orderField]: orderDirection,
          },
        }),
        this.prisma.artist.count({ where }),
      ]);

      return {
        artists,
        next: skipNumber + takeNumber < total,
        previous: skipNumber > 0,
        total,
        page: Math.floor(skipNumber / takeNumber) + 1,
        totalPages: Math.ceil(total / takeNumber),
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unable to fetch users',
      );
    }
  }

  async fetchArtistById(artistId: string): Promise<Artist | null> {
    return this.prisma.artist.findUnique({
      where: {
        id: artistId,
      },
    });
  }

  async fetchArtistByName(artistName: string): Promise<Artist | null> {
    return this.prisma.artist.findFirst({
      where: {
        name: artistName,
      },
    });
  }

  async deleteArtist(artistId: string): Promise<Artist> {
    return this.prisma.artist.delete({
      where: {
        id: artistId,
      },
    });
  }
}
