import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Artist } from 'generated/prisma';

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

  async fetchAllArtists(filters: {
    search?: string;
    skip?: string;
    take?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    artists: Artist[];
    skip: number;
    take: number;
    total: number;
    next: boolean;
    previous: boolean;
  }> {
    const { search, skip, take, sortBy, sortOrder, startDate, endDate } =
      filters;

    try {
      const where: Prisma.ArtistWhereInput = {};

      if (search) {
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
      }

      if (startDate || endDate) {
        where.createdAt = {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        };
      }

      const skipNumber = skip !== undefined ? parseInt(skip, 10) : 0;
      const takeNumber = take !== undefined ? parseInt(take, 10) : 10;

      const orderField = sortBy ?? 'createdAt';
      const orderDirection =
        (sortOrder ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

      const [artists, total] = await this.prisma.$transaction([
        this.prisma.artist.findMany({
          where,
          orderBy: {
            [orderField]: orderDirection,
          },
          skip: skipNumber,
          take: takeNumber,
        }),
        this.prisma.artist.count({ where }),
      ]);

      return {
        artists,
        skip: skipNumber,
        take: takeNumber,
        total,
        next: skipNumber + takeNumber < total,
        previous: skipNumber > 0,
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
