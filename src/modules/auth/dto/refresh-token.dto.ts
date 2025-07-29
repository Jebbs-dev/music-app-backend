import { IsNotEmpty } from 'class-validator';

class RefreshTokenDto {
  @IsNotEmpty()
  refresh_token: string;
}

export default RefreshTokenDto;
