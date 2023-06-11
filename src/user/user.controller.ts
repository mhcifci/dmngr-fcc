import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransformInterceptor } from 'src/interceptors/api-response.interceptor';

@UseGuards(JwtGuard)
@UseInterceptors(TransformInterceptor)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser('') user: User) {
    return this.userService.getUser(user);
  }
  @Patch('me')
  updateMe(@Body() UpdateUserDto: UpdateUserDto, @GetUser('') user: User) {
    return this.userService.updateUser(user, UpdateUserDto);
  }
}
