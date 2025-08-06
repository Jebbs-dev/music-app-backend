import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants/constants';
import { ArtistModule } from '../artists/artist.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    UserModule,
    ArtistModule,
    PrismaModule,
    TokenModule,
    JwtModule.register({
      global: true, // Make JwtModule available globally
      secret: jwtConstants.accessTokenSecret, // Default secret for access tokens
      signOptions: { expiresIn: jwtConstants.accessTokenExpiresIn },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
