import { Injectable } from '@nestjs/common';
import { Playlist } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async createPlaylist(data: CreatePlaylistDto): Promise<Playlist> {
    return this.prisma.playlist.create({
      data,
    });
  }

  getPlaylistById(playlistId: string): Promise<Playlist | null> {
    return this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        songs: true,
        albums: true,
      },
    });
  }

  async getPlaylists(userId: string): Promise<Playlist[]> {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        songs: true,
        albums: true,
      },
    });
  }

  async getPublicPlaylists(): Promise<Playlist[]> {
    return this.prisma.playlist.findMany({
      where: { isPublic: true },
      include: {
        songs: true,
        albums: true,
      },
    });
  }

  async addSongToPlaylist(
    playlistId: string,
    songId: string,
  ): Promise<Playlist> {
    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songs: {
          connect: { id: songId },
        },
      },
    });
  }

  async addAlbumToPlaylist(
    playlistId: string,
    albumId: string,
  ): Promise<Playlist> {
    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        albums: {
          connect: { id: albumId },
        },
      },
    });
  }

  async removeSongFromPlaylist(
    playlistId: string,
    songId: string,
  ): Promise<Playlist> {
    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        songs: {
          disconnect: { id: songId },
        },
      },
    });
  }

  async removeAlbumFromPlaylist(
    playlistId: string,
    albumId: string,
  ): Promise<Playlist> {
    return this.prisma.playlist.update({
      where: { id: playlistId },
      data: {
        albums: {
          disconnect: { id: albumId },
        },
      },
    });
  }
}
