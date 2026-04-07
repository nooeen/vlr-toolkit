import { IsBoolean, IsInt, IsOptional, ValidateNested } from "class-validator";

export type InfinityPaginationResultType<T> = Readonly<{
  data: T[];
  hasNextPage: boolean;
  created_at?: number;
}>;

export class InfinityPaginatedResponseDto<T>
  implements InfinityPaginationResultType<T>
{
  @ValidateNested()
  data: T[];

  @IsBoolean()
  hasNextPage: boolean;

  @IsOptional()
  @IsInt()
  created_at?: number;
}
