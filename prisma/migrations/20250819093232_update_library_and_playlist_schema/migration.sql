/*
  Warnings:

  - You are about to drop the column `libraryId` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the `LibraryAlbum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LibraryArtist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LibrarySong` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistAlbum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlaylistSong` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LibraryAlbum" DROP CONSTRAINT "LibraryAlbum_albumId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryAlbum" DROP CONSTRAINT "LibraryAlbum_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryAlbum" DROP CONSTRAINT "LibraryAlbum_userId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryArtist" DROP CONSTRAINT "LibraryArtist_artistId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryArtist" DROP CONSTRAINT "LibraryArtist_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "LibraryArtist" DROP CONSTRAINT "LibraryArtist_userId_fkey";

-- DropForeignKey
ALTER TABLE "LibrarySong" DROP CONSTRAINT "LibrarySong_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "LibrarySong" DROP CONSTRAINT "LibrarySong_songId_fkey";

-- DropForeignKey
ALTER TABLE "LibrarySong" DROP CONSTRAINT "LibrarySong_userId_fkey";

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_libraryId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistAlbum" DROP CONSTRAINT "PlaylistAlbum_albumId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistAlbum" DROP CONSTRAINT "PlaylistAlbum_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistSong" DROP CONSTRAINT "PlaylistSong_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistSong" DROP CONSTRAINT "PlaylistSong_songId_fkey";

-- AlterTable
ALTER TABLE "Album" ADD COLUMN     "playlistId" TEXT;

-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "libraryId";

-- DropTable
DROP TABLE "LibraryAlbum";

-- DropTable
DROP TABLE "LibraryArtist";

-- DropTable
DROP TABLE "LibrarySong";

-- DropTable
DROP TABLE "PlaylistAlbum";

-- DropTable
DROP TABLE "PlaylistSong";

-- CreateTable
CREATE TABLE "_ArtistToLibrary" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArtistToLibrary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AlbumToPlaylist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AlbumToPlaylist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AlbumToLibrary" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AlbumToLibrary_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PlaylistToSong" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PlaylistToSong_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LibraryToSong" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LibraryToSong_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LibraryToPlaylist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LibraryToPlaylist_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ArtistToLibrary_B_index" ON "_ArtistToLibrary"("B");

-- CreateIndex
CREATE INDEX "_AlbumToPlaylist_B_index" ON "_AlbumToPlaylist"("B");

-- CreateIndex
CREATE INDEX "_AlbumToLibrary_B_index" ON "_AlbumToLibrary"("B");

-- CreateIndex
CREATE INDEX "_PlaylistToSong_B_index" ON "_PlaylistToSong"("B");

-- CreateIndex
CREATE INDEX "_LibraryToSong_B_index" ON "_LibraryToSong"("B");

-- CreateIndex
CREATE INDEX "_LibraryToPlaylist_B_index" ON "_LibraryToPlaylist"("B");

-- AddForeignKey
ALTER TABLE "_ArtistToLibrary" ADD CONSTRAINT "_ArtistToLibrary_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToLibrary" ADD CONSTRAINT "_ArtistToLibrary_B_fkey" FOREIGN KEY ("B") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToPlaylist" ADD CONSTRAINT "_AlbumToPlaylist_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToPlaylist" ADD CONSTRAINT "_AlbumToPlaylist_B_fkey" FOREIGN KEY ("B") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToLibrary" ADD CONSTRAINT "_AlbumToLibrary_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToLibrary" ADD CONSTRAINT "_AlbumToLibrary_B_fkey" FOREIGN KEY ("B") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToSong" ADD CONSTRAINT "_PlaylistToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistToSong" ADD CONSTRAINT "_PlaylistToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryToSong" ADD CONSTRAINT "_LibraryToSong_A_fkey" FOREIGN KEY ("A") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryToSong" ADD CONSTRAINT "_LibraryToSong_B_fkey" FOREIGN KEY ("B") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryToPlaylist" ADD CONSTRAINT "_LibraryToPlaylist_A_fkey" FOREIGN KEY ("A") REFERENCES "Library"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LibraryToPlaylist" ADD CONSTRAINT "_LibraryToPlaylist_B_fkey" FOREIGN KEY ("B") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
