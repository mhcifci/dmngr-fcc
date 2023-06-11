import { IsInt, IsNotEmpty } from 'class-validator';

export class GetDomainDto {
  @IsInt()
  @IsNotEmpty()
  domainId: string;
}
