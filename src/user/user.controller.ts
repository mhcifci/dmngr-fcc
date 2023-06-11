import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtGuard)
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
