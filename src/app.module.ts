import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/users/user.module';
import { ArtistModule } from './modules/artists/artist.module';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SongModule } from './modules/songs/song.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    UserModule,
    ArtistModule,
    SongModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
