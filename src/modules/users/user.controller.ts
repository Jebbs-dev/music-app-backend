import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { Public } from '../../common/decorators/public.decorator';
import { FetchUsersDto } from './dto/fetch-users.dto';
import { hashPassword } from '../auth/utils/compare-password';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get(':userId')
  async fetchUser(@Param('userId') userId: string) {
    return this.usersService.fetchUser(userId);
  }

  @Public()
  @Get()
  async fetchAllUsers(
    @Query()
    filters: FetchUsersDto,
  ) {
    return this.usersService.fetchAllUsers(filters);
  }

  @Public()
  @Post()
  async createUser(@Body() userData: User) {
    const password = hashPassword(userData.password);

    return this.usersService.createUser({ ...userData, password });
  }

  @Patch(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() userData: Partial<User>,
  ) {
    return this.usersService.updateUser(userId, userData);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.usersService.deleteUser(userId);
  }
}
