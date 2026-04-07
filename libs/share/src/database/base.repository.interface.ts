import { HydratedDocument, UpdateWriteOpResult } from "mongoose";
import { QueryOptions } from "../validators/query-options.validator";
import { PaginatedResultType } from "../serializers/paginated-response.serializer";

export interface BaseRepositoryInterface<T> {
  create(dto: Partial<T> | T | any): Promise<T>;

  //bulkInsert(models: Array<Partial<T>>): Promise<Array<T>>;

  aggregate(pipeline: any, options: any): Promise<any>;

  findOne(query: QueryOptions, projection?: string): Promise<HydratedDocument<T>>;

  findById(id: any): Promise<HydratedDocument<T>>;

  find(query: QueryOptions);

  findWithPagination(query: QueryOptions): Promise<PaginatedResultType<HydratedDocument<T>>>;

  updateById(id: string, data: any): Promise<T>;

  updateOne(filter: any, data: any): Promise<UpdateWriteOpResult>;

  updateMany(filter: any, data: any): Promise<UpdateWriteOpResult>;

  //softDelete(id: string): Promise<UpdateWriteOpResult>;

  count(query: QueryOptions): Promise<number>;
}
