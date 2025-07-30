import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from './utils/compare-password';
import { LoginDto } from './dto/login.dto';
import { ArtistService } from '../artists/artist.service';
import { User, Artist } from 'generated/prisma';
import { jwtConstants } from './constants/constants';
import RefreshTokenDto from './dto/refresh-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';

type AuthAccount = User | Artist | null;

interface TokenPayload {
  sub: string;
  email: string;
  type: string;
  roles: string[];
  tokenType: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private artistService: ArtistService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(
    params: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = params;

    // Try to find user in User table
    let user: AuthAccount = await this.userService.fetchUserByEmail(email);
    let type = 'USER';

    // If not found, try Artist table
    if (!user) {
      user = await this.artistService.fetchArtistByEmail(email);
      type = 'ARTIST';
    }

    // If still not found or password doesn't match, throw
    if (!user || !comparePassword(password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    let roles: string[];
    if (type === 'ARTIST') {
      roles = [
        typeof (user as unknown as { role?: string }).role === 'string'
          ? String((user as unknown as { role?: string }).role)
          : 'ARTIST',
      ];
    } else {
      roles = [
        typeof (user as unknown as { role?: string }).role === 'string'
          ? String((user as unknown as { role?: string }).role)
          : 'USER',
      ];
    }

    const access_token = await this.generateAccessToken(
      user.id,
      user.email,
      type,
      roles,
    );
    const refresh_token = await this.generateRefreshToken(
      user.id,
      user.email,
      type,
      roles,
    );

    // Store refresh token in database
    await this.prisma.token.create({
      data: {
        userId: user.id,
        token: refresh_token,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });

    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshTokenDto.refresh_token,
        {
          secret: jwtConstants.refreshTokenSecret,
        },
      );

      // Verify it's a refresh token
      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token exists in database
      const tokenRecord = await this.prisma.token.findFirst({
        where: { token: refreshTokenDto.refresh_token },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // Check if token has expired
      const tokenAge = Math.floor(
        (Date.now() - tokenRecord.createdAt.getTime()) / 1000,
      );
      if (tokenAge > tokenRecord.expiresIn) {
        await this.prisma.token.delete({ where: { id: tokenRecord.id } });
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Generate new access token
      const access_token = await this.generateAccessToken(
        payload.sub,
        payload.email,
        payload.type,
        payload.roles,
      );

      return { access_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateAccessToken(
    userId: string,
    email: string,
    type: string,
    roles: string[],
  ): Promise<string> {
    const payload: TokenPayload = {
      sub: userId,
      email,
      type,
      roles,
      tokenType: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: jwtConstants.accessTokenSecret,
      expiresIn: jwtConstants.accessTokenExpiresIn,
    });
  }

  private async generateRefreshToken(
    userId: string,
    email: string,
    type: string,
    roles: string[],
  ): Promise<string> {
    const payload: TokenPayload = {
      sub: userId,
      email,
      type,
      roles,
      tokenType: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: jwtConstants.refreshTokenSecret,
      expiresIn: jwtConstants.refreshTokenExpiresIn,
    });
  }

  async validateToken(
    token: string,
    tokenType: 'access' | 'refresh' = 'access',
  ): Promise<TokenPayload> {
    try {
      const secret =
        tokenType === 'access'
          ? jwtConstants.accessTokenSecret
          : jwtConstants.refreshTokenSecret;

      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret,
      });

      if (payload.tokenType !== tokenType) {
        throw new UnauthorizedException('Invalid token type');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
