import { Injectable } from '@nestjs/common';
import { Playlist } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async createPlaylist(data: CreatePlaylistDto): Promise<Playlist> {
    // First upsert the library
    const library = await this.prisma.library.upsert({
      where: { userId: data.userId },
      create: { userId: data.userId },
      update: {},
    });

    // Then create the playlist
    return this.prisma.playlist.create({
      data: {
        ...data,
        libraryId: library.id,
      },
      include: {
        songs: true,
        albums: true,
      },
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
    // Get song with artist
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: { artist: true },
    });

    if (!song) {
      throw new Error('Song not found');
    }

    // Get playlist
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: {
        userId: true,
        library: { select: { userId: true } },
      },
    });

    if (!playlist) {
      throw new Error('Playlist not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Add song to playlist
      await tx.playlistSong.upsert({
        where: {
          playlistId_songId: {
            playlistId,
            songId,
          },
        },
        create: {
          playlistId,
          songId,
        },
        update: {},
      });

      // Auto-add artist to library (if user has a library)
      if (playlist.library?.userId) {
        const library = await tx.library.findUnique({
          where: { userId: playlist.library.userId },
          select: { id: true },
        });

        if (library) {
          await tx.libraryArtist.upsert({
            where: {
              userId_artistId: {
                userId: playlist.library.userId,
                artistId: song.artist.id,
              },
            },
            create: {
              userId: playlist.library.userId,
              artistId: song.artist.id,
              libraryId: library.id,
            },
            update: {},
          });
        }
      }
    });

    // Return the updated playlist
    return this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        songs: true,
        albums: true,
      },
    });
  }

  async addAlbumToPlaylist(playlistId: string, albumId: string): Promise<void> {
    try {
      // Get album with songs and artist
      const album = await this.prisma.album.findUnique({
        where: { id: albumId },
        include: {
          artist: true,
          songs: true,
        },
      });

      if (!album) {
        throw new Error('Album not found');
      }

      // Get playlist with user info
      const playlist = await this.prisma.playlist.findUnique({
        where: { id: playlistId },
        select: {
          userId: true,
          library: { select: { id: true, userId: true } },
        },
      });

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      await this.prisma.$transaction(async (tx) => {
        // Add songs to playlist
        for (const song of album.songs) {
          await tx.playlistSong.upsert({
            where: {
              playlistId_songId: {
                playlistId,
                songId: song.id,
              },
            },
            create: {
              playlistId,
              songId: song.id,
            },
            update: {},
          });
        }

        // Add album to playlist
        await tx.playlistAlbum.upsert({
          where: {
            playlistId_albumId: {
              playlistId,
              albumId,
            },
          },
          create: {
            playlistId,
            albumId,
          },
          update: {},
        });
      });

      // Auto-add artist to library (if user has a library)
      const userId = playlist.library?.userId || playlist.userId;
      if (userId && album.artist) {
        await this.addArtistToLibrary(userId, album.artist.id);
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new Error('Album or songs already exist in the playlist');
      }
      throw error;
    }
  }

  private async addArtistToLibrary(
    userId: string,
    artistId: string,
  ): Promise<void> {
    // Get or create the library
    const library = await this.prisma.library.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: { id: true },
    });

    // Add artist to library (using join table pattern)
    await this.prisma.libraryArtist.upsert({
      where: {
        userId_artistId: {
          userId,
          artistId,
        },
      },
      create: {
        userId,
        artistId,
        libraryId: library.id,
      },
      update: {}, // Do nothing if already exists
    });
  }

  async removeSongFromPlaylist(playlistId: string, songId: string) {
    await this.prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });
  }

  async removeAlbumFromPlaylist(playlistId: string, albumId: string) {
    return this.prisma.playlistAlbum.delete({
      where: {
        playlistId_albumId: {
          playlistId,
          albumId,
        },
      },
    });
  }
}
