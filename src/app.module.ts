import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/users/user.module';
import { ArtistModule } from './modules/artists/artist.module';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SongModule } from './modules/songs/song.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { SetMetadata } from '@nestjs/common';
import { AlbumModule } from './modules/album/album.module';
import { RolesGuard } from './common/guards/roles.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    UserModule,
    ArtistModule,
    AlbumModule,
    SongModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
