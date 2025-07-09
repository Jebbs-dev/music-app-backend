import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Song } from 'generated/prisma';
import { FetchSongsDto } from './dto/fetch-songs.dto';

@Injectable()
export class SongService {
  constructor(private prisma: PrismaService) {}

  async createSong(data: Song): Promise<Song> {
    return this.prisma.song.create({
      data,
    });
  }

  async fetchAllSongs(filters: FetchSongsDto): Promise<{
    songs: Song[];
    next: boolean;
    previous: boolean;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, skip, take, sortBy, sortOrder, startDate, endDate } =
      filters;

    try {
      const where: Prisma.SongWhereInput = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { artist: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // Validate dates
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
      const orderDirection = sortOrder === 'desc' ? 'desc' : 'asc';

      const [songs, total] = await this.prisma.$transaction([
        this.prisma.song.findMany({
          where,
          skip: skipNumber,
          take: takeNumber,
          orderBy: { [orderField]: orderDirection },
          include: {
            artist: {
              select: { id: true, name: true },
            }, // Include artist info
            album: {
              select: { id: true, title: true }, // Include basic song info
            },
          },
        }),
        this.prisma.song.count({ where }),
      ]);

      return {
        songs,
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
