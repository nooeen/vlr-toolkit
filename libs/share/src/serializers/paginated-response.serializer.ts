import { IsInt, IsOptional, ValidateNested } from "class-validator";

export type PaginatedResultType<T> = Readonly<{
  data: T[];
  page: number;
  total_items: number;
  total_pages: number;
  created_at?: number;
}>;

export class PaginatedResultDto<T> implements PaginatedResultType<T> {
  @ValidateNested()
  data: T[];

  @IsInt()
  page: number;

  @IsInt()
  total_items: number;

  @IsInt()
  total_pages: number;

  @IsOptional()
  @IsInt()
  created_at?: number;
}
