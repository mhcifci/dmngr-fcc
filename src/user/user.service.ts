import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUser(user: User) {
    return user;
  }
  async updateUser(user: User, dto: UpdateUserDto) {
    const updatedData: any = { ...dto }; // Güncellenmiş veriyi tutmak için kopyasını oluşturuyoruz

    try {
      if (dto.hash) {
        updatedData.hash = await argon.hash(dto.hash); // Kullanıcıdan gelen password değerini hash'e çevirerek güncellenmiş veriye ekliyoruz
      }
      const result = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: { ...dto },
      });
      delete result.hash; // Güvenlik için hash'i silip geri döndürüyoruz
      return true;
    } catch (error) {
      throw error;
    }
  }
}
