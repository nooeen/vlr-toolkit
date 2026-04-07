import { IsInt, IsOptional, ValidateNested } from "class-validator";

export type NonPaginatedResultType<T> = Readonly<{
  data: T[];
  created_at?: number;
}>;

export class NonPaginatedResultDto<T> implements NonPaginatedResultType<T> {
  @ValidateNested()
  data: T[];

  @IsOptional()
  @IsInt()
  created_at?: number;
}
