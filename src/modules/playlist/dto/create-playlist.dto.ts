import { IsString, IsNotEmpty } from 'class-validator';

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
}
