import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class FetchArtistsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  @IsString()
  skip?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  @IsString()
  take?: string;

  @IsOptional()
  @IsIn(['createdAt', 'title', 'group'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
