import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { jwtConstants } from './constants/constants';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/app.module';

interface TokenPayload {
  sub: string;
  email: string;
  type: string;
  roles: string[];
  tokenType: 'access' | 'refresh';
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: jwtConstants.accessTokenSecret,
      });

      // Verify it's an access token
      if (payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        type: payload.type,
        roles: payload.roles,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
