import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Album } from 'generated/prisma';
import { FetchAlbumsDto } from './dto/fetch-albums.dto';

@Injectable()
export class AlbumService {
  constructor(private prisma: PrismaService) {}

  async createAlbum(data: Album): Promise<Album> {
    return this.prisma.album.create({
      data,
    });
  }

  async fetchAlbum(albumId: string): Promise<Album | null> {
    return this.prisma.album.findUnique({
      where: { id: albumId },
    });
  }

  async fetchAllAlbums(filters: FetchAlbumsDto): Promise<{
    albums: Album[];
    next: boolean;
    previous: boolean;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, skip, take, sortBy, sortOrder, startDate, endDate } =
      filters;

    const where: Prisma.AlbumWhereInput = {};

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
    const orderDirection =
      (sortOrder ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [albums, total] = await Promise.all([
      this.prisma.album.findMany({
        where,
        skip: skipNumber,
        take: takeNumber,
        orderBy: {
          [orderField]: orderDirection,
        },
        include: {
          artist: {
            select: { id: true, name: true },
          }, // Include artist info
          songs: {
            select: { id: true, title: true }, // Include basic song info
          },
        },
      }),
      this.prisma.album.count({ where }),
    ]);

    return {
      albums,
      next: skipNumber + takeNumber < total,
      previous: skipNumber > 0,
      total,
      page: Math.floor(skipNumber / takeNumber) + 1,
      totalPages: Math.ceil(total / takeNumber),
    };
  }

  async updateAlbum(
    albumId: string,
    data: Partial<Album>,
  ): Promise<Album | null> {
    return this.prisma.album.update({
      where: { id: albumId },
      data,
    });
  }

  async deleteAlbum(albumId: string): Promise<Album | null> {
    return this.prisma.album.delete({
      where: { id: albumId },
    });
  }
}
