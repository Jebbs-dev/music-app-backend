import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma } from 'generated/prisma';
import { hashPassword } from '../auth/utils/compare-password';
import { FetchUsersDto } from './dto/fetch-users.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: User): Promise<User> {
    const password = hashPassword(data.password);

    return this.prisma.user.create({
      data: {
        ...data,
        password,
      },
    });
  }

  async fetchUser(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return user;
  }

  async fetchAllUsers(filters: FetchUsersDto): Promise<{
    users: User[];
    next: boolean;
    previous: boolean;
    total: number;
    page: number;
    totalPages: number;
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

      // Validate dates
      let startDateObj: Date | undefined;
      let endDateObj: Date | undefined;

      if (startDate) {
        startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          throw new Error('Invalid startDate format');
        }
      }

      if (endDate) {
        endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          throw new Error('Invalid endDate format');
        }
      }

      if (startDateObj || endDateObj) {
        where.createdAt = {
          ...(startDateObj && { gte: startDateObj }),
          ...(endDateObj && { lte: endDateObj }),
        };
      }

      const skipNumber = Math.max(0, skip ? parseInt(skip, 10) || 0 : 0);
      const takeNumber = Math.min(
        100,
        Math.max(1, take ? parseInt(take, 10) || 10 : 10),
      );

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
        next: skipNumber + takeNumber < total,
        previous: skipNumber > 0,
        total,
        page: Math.floor(skipNumber / takeNumber) + 1,
        totalPages: Math.ceil(total / takeNumber),
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Unable to fetch users',
      );
    }
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
