import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class GetUserDto {
  @IsInt()
  id: string;
}
