import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Song } from 'generated/prisma';

@Injectable()
export class SongService {
  constructor(private prisma: PrismaService) {}

  async createSong(data: Song): Promise<Song> {
    return this.prisma.song.create({
      data,
    });
  }

  async fetchAllSongs(filters: {
    search?: string;
    skip?: string;
    take?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    songs: Song[];
    skip: number;
    take: number;
    total: number;
    next: boolean;
    previous: boolean;
  }> {
    const { search, skip, take, sortBy, sortOrder, startDate, endDate } =
      filters;

    try {
      const where: Prisma.SongWhereInput = {};

      if (search) {
        where.OR = [{ title: { contains: search, mode: 'insensitive' } }];
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
      const orderDirection = sortOrder === 'desc' ? 'desc' : 'asc';

      const [songs, total] = await this.prisma.$transaction([
        this.prisma.song.findMany({
          where,
          skip: skipNumber,
          take: takeNumber,
          orderBy: { [orderField]: orderDirection },
        }),
        this.prisma.song.count({ where }),
      ]);

      return {
        songs,
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

  async fetchSongById(songId: string): Promise<Song | null> {
    return this.prisma.song.findUnique({
      where: {
        id: songId,
      },
    });
  }

  async fetchSongsByArtistId(artistId: string): Promise<Song[]> {
    return this.prisma.song.findMany({
      where: {
        artistId: artistId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async fetchSongsByAlbumId(albumId: string): Promise<Song[]> {
    return this.prisma.song.findMany({
      where: {
        albumId: albumId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async fetchSongByTitle(title: string): Promise<Song | null> {
    return this.prisma.song.findFirst({
      where: {
        title: { contains: title, mode: 'insensitive' },
      },
    });
  }

  async updateSong(songId: string, data: Partial<Song>): Promise<Song> {
    return this.prisma.song.update({
      where: {
        id: songId,
      },
      data,
    });
  }

  async deleteSong(songId: string): Promise<Song> {
    return this.prisma.song.delete({
      where: {
        id: songId,
      },
    });
  }
}
