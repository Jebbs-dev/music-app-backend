// token-management.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { jwtConstants } from '../../auth/constants/constants';

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'USER' | 'ARTIST';
  roles: string[];
  tokenType: 'access' | 'refresh';
  // jti?: string; // JWT ID for tracking
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class TokenManagementService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async generateTokenPair(
    userId: string,
    email: string,
    type: 'USER' | 'ARTIST',
    roles: string[],
  ): Promise<TokenPair> {
    const [access_token, refresh_token] = await Promise.all([
      this.generateAccessToken(userId, email, type, roles),
      this.generateRefreshToken(userId, email, type, roles),
    ]);

    await this.storeRefreshToken(refresh_token, userId, type);

    return { access_token, refresh_token };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = await this.verifyRefreshToken(refreshToken);

      // Check if token exists and is valid in database
      const tokenRecord = await this.validateStoredToken(refreshToken);

      // Generate new token pair (token rotation)
      const newTokenPair = await this.generateTokenPair(
        payload.sub,
        payload.email,
        payload.type,
        payload.roles,
      );

      // Remove old refresh token and store new one
      await this.rotateRefreshToken(
        tokenRecord.id,
        newTokenPair.refresh_token,
        payload.sub,
        payload.type,
      );

      return newTokenPair;
    } catch (error: unknown) {
      throw new UnauthorizedException(
        (error as Error)?.message ?? 'Invalid or expired refresh token',
      );
    }
  }

  async revokeToken(refreshToken: string): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { token: refreshToken },
    });
  }

  async revokeAllUserTokens(
    userId: string,
    type: 'USER' | 'ARTIST',
  ): Promise<void> {
    const whereClause = type === 'USER' ? { userId } : { artistId: userId };

    await this.prisma.token.deleteMany({
      where: whereClause,
    });
  }

  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.token.deleteMany({
      where: {
        createdAt: {
          lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      },
    });

    return result.count;
  }

  // async isTokenBlacklisted(jti: string): Promise<boolean> {
  //   const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
  //     where: { jti },
  //   });

  //   return !!blacklistedToken;
  // }

  // async blacklistToken(token: string): Promise<void> {
  //   try {
  //     const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
  //       secret: jwtConstants.accessTokenSecret,
  //     });

  //     if (payload.jti) {
  //       await this.prisma.blacklistedToken.create({
  //         data: {
  //           jti: payload.jti,
  //           expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Access token expiry
  //         },
  //       });
  //     }
  //   } catch {
  //     // Token is already invalid, no need to blacklist
  //   }
  // }

  // Private methods

  private async generateAccessToken(
    userId: string,
    email: string,
    type: 'USER' | 'ARTIST',
    roles: string[],
  ): Promise<string> {
    // const jti = this.generateJTI();
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
    type: 'USER' | 'ARTIST',
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

  private async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: jwtConstants.refreshTokenSecret,
    });

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    return payload;
  }

  private async storeRefreshToken(
    refreshToken: string,
    userId: string,
    type: 'USER' | 'ARTIST',
  ): Promise<void> {
    await this.prisma.token.create({
      data: {
        userId: type === 'USER' ? userId : null,
        artistId: type === 'ARTIST' ? userId : null,
        token: refreshToken,
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      },
    });
  }

  private async validateStoredToken(refreshToken: string) {
    const tokenRecord = await this.prisma.token.findFirst({
      where: { token: refreshToken },
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

    return tokenRecord;
  }

  private async rotateRefreshToken(
    oldTokenId: string,
    newRefreshToken: string,
    userId: string,
    type: 'USER' | 'ARTIST',
  ): Promise<void> {
    await this.prisma.$transaction([
      // Delete old token
      this.prisma.token.delete({ where: { id: oldTokenId } }),
      // Store new token
      this.prisma.token.create({
        data: {
          userId: type === 'USER' ? userId : null,
          artistId: type === 'ARTIST' ? userId : null,
          token: newRefreshToken,
          expiresIn: 7 * 24 * 60 * 60,
        },
      }),
    ]);
  }

  private generateJTI(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
