/*
  Warnings:

  - You are about to drop the column `libraryId` on the `PlaylistAlbum` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PlaylistAlbum" DROP CONSTRAINT "PlaylistAlbum_libraryId_fkey";

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "PlaylistAlbum" DROP COLUMN "libraryId";
