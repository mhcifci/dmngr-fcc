import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto, GetDomainDto } from './dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('domain')
export class DomainController {
  constructor(private domainService: DomainService) {}

  @Get('/')
  getAllDomains() {
    return this.domainService.getAllDomains();
  }

  @Get('/detail/:id')
  getDomain(@Param('id', ParseIntPipe) id: number) {
    return this.domainService.getDomain(id);
  }

  @Post('/')
  createDomain(@Body() dto: CreateDomainDto, @GetUser('') user: User) {
    return this.domainService.createDomain(dto, user);
  }
}
