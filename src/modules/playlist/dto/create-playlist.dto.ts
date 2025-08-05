import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  libraryId: string;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
