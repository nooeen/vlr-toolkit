import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export type PaginationOptionsType = {
  page?: number;
  limit?: number;
};

export class PaginationOptionsDto implements PaginationOptionsType {
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  limit = 24;
}
