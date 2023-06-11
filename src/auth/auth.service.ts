import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    // generate  password hash

    const hash = await argon.hash(dto.password);

    try {
      // save user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;
      // returned saved user
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user  does not exist throw exception
    if (!user) throw new ForbiddenException('Credintials incorrect!');
    // compare password hash with password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // if password does not match throw exception
    if (!pwMatches) throw new ForbiddenException('Credintials incorrect!');
    delete user.hash;
    // All is ok, send back user
    return await this.signToken(user.id, user.email);
  }

  // Token sign method.
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('LOGIN_EXPIRATION_TIME'),
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
