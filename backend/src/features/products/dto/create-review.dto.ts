import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
