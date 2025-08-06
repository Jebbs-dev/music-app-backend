import { Module } from '@nestjs/common';
import { TokenManagementService } from './token.service';

@Module({
  providers: [TokenManagementService],
  exports: [TokenManagementService],
})
export class TokenModule {}
