import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDomainDto, GetDomainDto } from './dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class DomainService {
  constructor(private prisma: PrismaService) {}

  async getAllDomains() {
    return await this.prisma.domain.findMany();
  }

  async createDomain(dto: CreateDomainDto, user: User) {
    try {
      return await this.prisma.domain.create({
        data: { ...dto, userId: user.id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Domain already exists');
        }
      }
      throw error;
    }
  }

  async getDomain(id: number) {
    try {
      const result = await this.prisma.domain.findUnique({
        where: { id },
      });
      if (result === null) {
        throw new BadRequestException('Domain not found');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
