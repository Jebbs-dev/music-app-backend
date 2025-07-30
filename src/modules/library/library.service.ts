import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Library } from 'generated/prisma';

@Injectable()
export class LibraryService {
  constructor(private prisma: PrismaService) {}

  async fetchLibrary(userId: string): Promise<Library | null> {
    return await this.prisma.library.findUnique({
      where: { userId },
      include: {
        albums: true,
        songs: true,
        playlists: true,
      },
    });
  }

  async addAlbumToLibrary(userId: string, albumId: string): Promise<Library> {
    return this.prisma.library.update({
      where: { userId },
      data: {
        albums: {
          connect: { id: albumId },
        },
      },
    });
  }

  async addSongToLibrary(userId: string, songId: string): Promise<Library> {
    return this.prisma.library.update({
      where: { userId },
      data: {
        songs: {
          connect: { id: songId },
        },
      },
    });
  }

  async addPlaylistToLibrary(
    userId: string,
    playlistId: string,
  ): Promise<Library> {
    return this.prisma.library.update({
      where: { userId },
      data: {
        playlists: {
          connect: { id: playlistId },
        },
      },
    });
  }

  async removeAlbumFromLibrary(
    userId: string,
    albumId: string,
  ): Promise<Library> {
    return this.prisma.library.update({
      where: { userId },
      data: {
        albums: {
          disconnect: { id: albumId },
        },
      },
    });
  }

  async removeSongFromLibrary(
    userId: string,
    songId: string,
  ): Promise<Library> {
    return this.prisma.library.update({
      where: { userId },
      data: {
        songs: {
          disconnect: { id: songId },
        },
      },
    });
  }

  async removePlaylistFromLibrary(
    userId: string,
    playlistId: string,
  ): Promise<Library> {
    return this.prisma.library.update({
      where: { userId },
      data: {
        playlists: {
          disconnect: { id: playlistId },
        },
      },
    });
  }
}
