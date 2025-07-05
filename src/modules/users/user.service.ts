import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async fetchUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  }

  async fetchAllUsers(filters: {
    search?: string;
    skip?: string;
    take?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }): Promise<{
    users: User[];
    skip: number;
    take: number;
    total: number;
    next: boolean;
    previous: boolean;
  }> {
    const { search, skip, take, sortBy, sortOrder, startDate, endDate } =
      filters;

    try {
      const where: Prisma.UserWhereInput = {
        role: 'USER',
      };

      if (search) {
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
      }

      if (startDate || endDate) {
        where.createdAt = {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        };
      }

      const skipNumber = skip !== undefined ? parseInt(skip, 10) : 0;
      const takeNumber = take !== undefined ? parseInt(take, 10) : 10;

      const orderField = sortBy ?? 'createdAt';
      const orderDirection =
        (sortOrder ?? 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          orderBy: {
            [orderField]: orderDirection,
          },
          skip: skipNumber,
          take: takeNumber,
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        users,
        skip: skipNumber,
        take: takeNumber,
        total,
        next: skipNumber + takeNumber < total,
        previous: skipNumber > 0,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unable to fetch users',
      );
    }
  }

  async createUser(data: User): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: userId, // Assuming 'where' is an object with an 'id' property
      },
      data,
    });
  }

  async deleteUser(userId: string): Promise<User> {
    return this.prisma.user.delete({
      where: {
        id: userId, // Assuming userId is an object with an 'id' property
      },
    });
  }
}
