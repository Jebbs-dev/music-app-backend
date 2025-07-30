/*
  Warnings:

  - You are about to drop the `LibraryPlaylist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_LibraryToLibrarySong` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `libraryId` on table `LibraryAlbum` required. This step will fail if there are existing NULL values in that column.
  - Made the column `libraryId` on table `LibraryArtist` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `libraryId` to the `LibrarySong` table without a default value. This is not possible if the table is not empty.
  - Added the required column `libraryId` to the `Playlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LibraryAlbum" DROP CONSTRAINT "LibraryAlbum_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryArtist" DROP CONSTRAINT "LibraryArtist_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryPlaylist" DROP CONSTRAINT "LibraryPlaylist_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryPlaylist" DROP CONSTRAINT "LibraryPlaylist_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryPlaylist" DROP CONSTRAINT "LibraryPlaylist_userId_fkey";

-- DropForeignKey
ALTER TABLE "_LibraryToLibrarySong" DROP CONSTRAINT "_LibraryToLibrarySong_A_fkey";

-- DropForeignKey
ALTER TABLE "_LibraryToLibrarySong" DROP CONSTRAINT "_LibraryToLibrarySong_B_fkey";

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'ARTIST',
ADD COLUMN     "subscribers" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "LibraryAlbum" ALTER COLUMN "libraryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LibraryArtist" ALTER COLUMN "libraryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LibrarySong" ADD COLUMN     "libraryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "libraryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "playCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "LibraryPlaylist";

-- DropTable
DROP TABLE "_LibraryToLibrarySong";

-- CreateTable
CREATE TABLE "PlaylistAlbum" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "libraryId" TEXT NOT NULL,

    CONSTRAINT "PlaylistAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "artistId" TEXT,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresIn" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaylistAlbum_playlistId_idx" ON "PlaylistAlbum"("playlistId");

-- CreateIndex
CREATE INDEX "PlaylistAlbum_albumId_idx" ON "PlaylistAlbum"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistAlbum_playlistId_albumId_key" ON "PlaylistAlbum"("playlistId", "albumId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "Token"("token");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistAlbum" ADD CONSTRAINT "PlaylistAlbum_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistAlbum" ADD CONSTRAINT "PlaylistAlbum_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistAlbum" ADD CONSTRAINT "PlaylistAlbum_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibrarySong" ADD CONSTRAINT "LibrarySong_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryAlbum" ADD CONSTRAINT "LibraryAlbum_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryArtist" ADD CONSTRAINT "LibraryArtist_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
