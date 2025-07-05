import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'generated/prisma';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get(':userId')
  async fetchUser(@Param('userId') userId: string) {
    return this.usersService.fetchUser(userId);
  }

  @Get()
  async fetchAllUsers(
    @Param()
    filters: {
      search?: string;
      skip?: string;
      take?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.usersService.fetchAllUsers(filters);
  }

  @Post()
  async createUser(@Body() userData: User) {
    return this.usersService.createUser(userData);
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
