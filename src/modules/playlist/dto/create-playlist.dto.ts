import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @IsString()
  @IsOptional()
  libraryId?: string;
}
