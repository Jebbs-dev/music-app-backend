import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
}
