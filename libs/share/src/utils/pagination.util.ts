import { InfinityPaginationResultType } from "../serializers/infinity-pagination-result.serializer";
import { PaginationOptionsType } from "../validators/pagination.validator";

export const getPaginationProp = (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  return {
    offset,
  };
};

export const getTotalPaginatedPages = (limit: number, totalItems: number) => {
  const totalPages = Math.ceil(totalItems / limit);
  return totalPages;
};

export const infinityPagination = <T>(
  data: T[],
  options: PaginationOptionsType
): InfinityPaginationResultType<T> => {
  return {
    data,
    hasNextPage: data.length === options.limit,
  };
};
