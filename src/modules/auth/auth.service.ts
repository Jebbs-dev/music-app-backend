// auth.service.ts - Updated to use TokenManagementService
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { ArtistService } from '../artists/artist.service';
import { comparePassword } from './utils/compare-password';
import { LoginDto } from './dto/login.dto';
import { User, Artist } from 'generated/prisma';
import { TokenManagementService, TokenPair } from './token/token.service';
import RefreshTokenDto from './dto/refresh-token.dto';

type AuthAccount = User | Artist;

export interface AuthResult extends TokenPair {
  userInfo: {
    id: string;
    name: string;
    email: string;
    type: 'USER' | 'ARTIST';
  };
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private artistService: ArtistService,
    private tokenManagementService: TokenManagementService,
  ) {}

  async signIn(params: LoginDto): Promise<AuthResult> {
    const { email, password } = params;

    // Find and authenticate user
    const authData = await this.findAndAuthenticateUser(email, password);

    // Generate token pair
    const tokens = await this.tokenManagementService.generateTokenPair(
      authData.user.id,
      authData.user.email,
      authData.type,
      authData.roles,
    );

    return {
      ...tokens,
      userInfo: {
        id: authData.user.id,
        name: authData.user.name ?? 'Unknown',
        email: authData.user.email,
        type: authData.type,
      },
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.tokenManagementService.refreshAccessToken(
      refreshTokenDto.refresh_token,
    );
  }

  async logout(refreshToken: string): Promise<void> {
    // Revoke refresh token
    await this.tokenManagementService.revokeToken(refreshToken);

    // // Optionally blacklist access token for immediate invalidation
    // if (accessToken) {
    //   await this.tokenManagementService.blacklistToken(accessToken);
    // }
  }

  async logoutAllDevices(
    userId: string,
    type: 'USER' | 'ARTIST',
  ): Promise<void> {
    await this.tokenManagementService.revokeAllUserTokens(userId, type);
  }

  // Private helper methods

  private async findAndAuthenticateUser(
    email: string,
    password: string,
  ): Promise<{
    user: AuthAccount;
    type: 'USER' | 'ARTIST';
    roles: string[];
  }> {
    // Try to find user in User table
    let user: AuthAccount | null =
      await this.userService.fetchUserByEmail(email);
    let type: 'USER' | 'ARTIST' = 'USER';

    // If not found, try Artist table
    if (!user) {
      user = await this.artistService.fetchArtistByEmail(email);
      type = 'ARTIST';
    }

    // Validate user exists and password matches
    if (!user || !user.password || !comparePassword(password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Extract roles more safely
    const roles = this.extractUserRoles(user, type);

    return { user, type, roles };
  }

  private extractUserRoles(
    user: AuthAccount,
    type: 'USER' | 'ARTIST',
  ): string[] {
    // Type-safe role extraction
    const userWithRole = user as AuthAccount & { role?: string };
    const role = userWithRole.role || type;
    return [role];
  }
}
