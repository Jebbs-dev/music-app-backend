import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from './utils/compare-password';
import { LoginDto } from './dto/login.dto';
import { ArtistService } from '../artists/artist.service';
import { User, Artist } from 'generated/prisma';

type AuthAccount = User | Artist | null;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private artistService: ArtistService,
    private jwtService: JwtService,
  ) {}

  async signIn(params: LoginDto): Promise<{ access_token: string }> {
    const { email, password } = params;

    // Try to find user in User table
    let user: AuthAccount = await this.userService.fetchUserByEmail(email);
    let type = 'user';

    // If not found, try Artist table
    if (!user) {
      user = await this.artistService.fetchArtistByEmail(email);
      type = 'artist';
    }

    // If still not found or password doesn't match, throw
    if (!user || !comparePassword(password, user.password)) {
      throw new UnauthorizedException();
    }

    // Add type to payload so you know what kind of account it is
    const payload = { sub: user.id, email: user.email, type };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
