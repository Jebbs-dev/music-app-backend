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
        albums: {
          select: {
            id: true,
            album: true,
            userId: true,
          },
        },
        songs: {
          select: {
            id: true,
            song: true,
            userId: true,
          },
        },
        playlists: {
          select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
            songs: {
              select: {
                id: true,
                song: true,
              },
            },
            albums: {
              select: {
                id: true,
                album: true,
              },
            },
            userId: true,
          },
        },
        artists: {
          select: {
            id: true,
            artist: true,
            userId: true,
          },
        },
      },
    });
  }

  async addAlbumToLibrary(userId: string, albumId: string): Promise<Library> {
    const album = await this.prisma.album.findUnique({
      where: { id: albumId },
      include: {
        artist: true,
        songs: { select: { id: true } },
      },
    });

    if (!album) {
      throw new Error('Album not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const library = await tx.library.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await Promise.all([
        tx.libraryAlbum.upsert({
          where: { userId_albumId: { userId, albumId } },
          create: { userId, albumId, libraryId: library.id },
          update: {},
        }),

        tx.libraryArtist.upsert({
          where: { userId_artistId: { userId, artistId: album.artist.id } },
          create: { userId, artistId: album.artist.id, libraryId: library.id },
          update: {},
        }),
      ]);

      if (album.songs.length > 0) {
        await tx.librarySong.createMany({
          data: album.songs.map((song) => ({
            userId,
            songId: song.id,
            libraryId: library.id,
          })),
          skipDuplicates: true,
        });
      }
    });

    return this.prisma.library.findUniqueOrThrow({
      where: { userId },
      include: {
        songs: { include: { song: true } },
        albums: { include: { album: true } },
        artists: { include: { artist: true } },
      },
    });
  }

  async addSongToLibrary(userId: string, songId: string): Promise<Library> {
    // Get song with artist info (should be fast with proper indexes)
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: {
        artist: { select: { id: true } }, // Only select what we need
      },
    });

    if (!song) {
      throw new Error('Song not found');
    }

    await this.prisma.$transaction(async (tx) => {
      const library = await tx.library.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      await Promise.all([
        tx.librarySong.upsert({
          where: {
            userId_songId: { userId, songId },
          },
          create: {
            userId,
            songId,
            libraryId: library.id,
          },
          update: {},
        }),

        // Auto-add artist to library
        tx.libraryArtist.upsert({
          where: {
            userId_artistId: { userId, artistId: song.artist.id },
          },
          create: {
            userId,
            artistId: song.artist.id,
            libraryId: library.id,
          },
          update: {}, // No-op if already exists
        }),
      ]);
    });

    // Fetch final result outside transaction to avoid long locks
    return this.prisma.library.findUniqueOrThrow({
      where: { userId },
      include: {
        songs: { include: { song: true } },
        albums: { include: { album: true } },
        artists: { include: { artist: true } },
      },
    });
  }

  // async addPlaylistToLibrary(
  //   userId: string,
  //   playlistId: string,
  // ): Promise<Library> {
  //   try {
  //     return await this.prisma.library.upsert({
  //       where: { userId },
  //       create: {
  //         userId,
  //         playlists: {
  //           connect: { id: playlistId },
  //         },
  //       },
  //       update: {
  //         playlists: {
  //           connect: { id: playlistId },
  //         },
  //       },
  //       include: {
  //         playlists: true,
  //         songs: {
  //           include: {
  //             song: true,
  //           },
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     if (
  //       typeof error === 'object' &&
  //       error !== null &&
  //       'code' in error &&
  //       (error as { code?: string }).code === 'P2002'
  //     ) {
  //       throw new Error('Playlist already exists in library');
  //     }
  //     // Re-throw other errors
  //     throw error;
  //   }
  // }

  async removeAlbumFromLibrary(
    userId: string,
    albumId: string,
  ): Promise<Library> {
    try {
      return await this.prisma.library.update({
        where: { userId },
        data: {
          albums: {
            deleteMany: {
              userId,
              albumId,
            },
          },
        },
        include: {
          albums: {
            include: {
              album: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2025'
      ) {
        throw new Error('Library not found for user');
      }
      // Re-throw other errors
      throw error;
    }
  }

  async removeSongFromLibrary(
    userId: string,
    songId: string,
  ): Promise<Library> {
    try {
      return await this.prisma.library.update({
        where: { userId },
        data: {
          songs: {
            deleteMany: {
              userId,
              songId,
            },
          },
        },
        include: {
          songs: {
            include: {
              song: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2025'
      ) {
        throw new Error('Library not found for user');
      }
      // Re-throw other errors
      throw error;
    }
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

  //To fix disconnect issue although, I'm not sure this is a service that will be in use because all playlists by default are in the library

  // Delete the playlist entirely
  // async removePlaylistFromLibrary(
  //   userId: string,
  //   playlistId: string,
  // ): Promise<Library> {
  //   try {
  //     return await this.prisma.library.update({
  //       where: { userId },
  //       data: {
  //         playlists: {
  //           delete: { id: playlistId },
  //         },
  //       },
  //       include: {
  //         playlists: true,
  //         songs: {
  //           include: {
  //             song: true,
  //           },
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     if (error.code === 'P2025') {
  //       throw new Error('Library or playlist not found');
  //     }
  //     throw error;
  //   }
  // }

  // libraryId String? with optional Library Id
  // async removePlaylistFromLibraryWithDisconnect(
  //   userId: string,
  //   playlistId: string,
  // ): Promise<Library> {
  //   try {
  //     return await this.prisma.library.update({
  //       where: { userId },
  //       data: {
  //         playlists: {
  //           disconnect: { id: playlistId },
  //         },
  //       },
  //       include: {
  //         playlists: true,
  //       },
  //     });
  //   } catch (error) {
  //     if (error.code === 'P2025') {
  //       throw new Error('Library or playlist not found');
  //     }
  //     throw error;
  //   }
  // }
}
