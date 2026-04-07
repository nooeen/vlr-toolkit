import { NullableType } from "@app/share/types/nullable.type";
import { HydratedDocument, Model, UpdateWriteOpResult } from "mongoose";
import { BaseSchema } from "./base.schema";
import { QueryOptions } from "../validators/query-options.validator";
import { PaginatedResultType } from "../serializers/paginated-response.serializer";
import {
  getPaginationProp,
  getTotalPaginatedPages,
} from "../utils/pagination.util";

export abstract class BaseRepositoryAbstract<T extends BaseSchema> {
  protected constructor(private readonly model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  /*bulkInsert(models: Array<Partial<T>>): Promise<Array<T>> {
    return this.model.create(models);
  }*/

  async aggregate(pipeline: any, options: any = {}): Promise<any> {
    return this.model.aggregate(pipeline, options);
  }

  async findOne(
    query: QueryOptions
  ): Promise<NullableType<HydratedDocument<T>>> {
    let dataQuery = null;
    let cacheKey = "";

    if (query.cache_key && query.cache_key.length) {
      cacheKey = query.cache_key;
    }

    dataQuery = this.model.findOne(query.filter);
    if (cacheKey && cacheKey.length) {
      cacheKey = `${cacheKey}_filter_${JSON.stringify(query.filter)}`;
    }

    if (process.env.NODE_ENV === "production") {
      if (query.cache_time) {
        return dataQuery.cacheQuery({
          ttl: query.cache_time,
          ...(cacheKey &&
            cacheKey.length && {
              cacheKey: query.cache_key,
            }),
        });
      }
    }

    return await dataQuery.exec();
  }

  async findById(id: any): Promise<NullableType<HydratedDocument<T>>> {
    return this.model.findById(id);
  }

  async find(query: QueryOptions) {
    let dataQuery: any;
    let cacheKey = "";

    if (query.cache_key && query.cache_key.length) {
      cacheKey = query.cache_key;
    }

    if (query.filter) {
      dataQuery = this.model.find(query.filter);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_filter_${JSON.stringify(query.filter)}`;
      }
    } else {
      dataQuery = this.model.find({});
    }

    if (query.sort !== null) {
      dataQuery.sort(query.sort);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_sort_${JSON.stringify(query.sort)}`;
      }
    }

    if (query.limit !== null) {
      dataQuery.limit(query.limit);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_limit_${JSON.stringify(query.limit)}`;
      }
    }

    if (query.offset !== null) {
      dataQuery.skip(query.offset);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_offset_${JSON.stringify(query.offset)}`;
      }
    }

    if (query.select) {
      dataQuery.select(query.select);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_select_${JSON.stringify(query.select)}`;
      }
    }

    if (query.cursor) {
      return dataQuery.cursor();
    }

    if (process.env.NODE_ENV === "production") {
      if (query.cache_time) {
        return dataQuery.cacheQuery({
          ttl: query.cache_time,
          ...(cacheKey && cacheKey.length && { cacheKey }),
        });
      }
    }

    return await dataQuery.exec();
  }

  async findWithPagination(
    query: QueryOptions
  ): Promise<PaginatedResultType<HydratedDocument<T>>> {
    let dataQuery: any;
    let dataCountQuery: any;

    let cacheKey = "";
    if (query.cache_key && query.cache_key.length) {
      cacheKey = query.cache_key;
    }

    if (query.filter) {
      dataCountQuery = this.model.countDocuments(query.filter);
      dataQuery = this.model.find(query.filter);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_filter_${JSON.stringify(query.filter)}`;
      }
    } else {
      dataCountQuery = this.model.countDocuments({});
      dataQuery = this.model.find({});
    }

    if (query.sort !== null) {
      dataQuery.sort(query.sort);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_sort_${JSON.stringify(query.sort)}`;
      }
    }

    // offset is disabled for this function

    if (query.select) {
      dataCountQuery.select(query.select);
      dataQuery.select(query.select);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_select_${JSON.stringify(query.select)}`;
      }
    }

    dataQuery.skip(getPaginationProp(query.page, query.limit).offset);

    if (query.limit !== null) {
      dataQuery.limit(query.limit);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_limit_${JSON.stringify(query.limit)}`;
      }
    }

    if (process.env.NODE_ENV === "production") {
      if (query.cache_time) {
        const countQuery = await dataCountQuery.cacheQuery({
          ...(cacheKey && cacheKey.length && { cacheKey: `count_${cacheKey}` }),
          ttl: query.cache_time,
        });

        return {
          data: await dataQuery.cacheQuery({
            ...(cacheKey &&
              cacheKey.length && {
                cacheKey: `${cacheKey}_page_${query.page}`,
              }),
            ttl: query.cache_time,
          }),
          page: query.page,
          total_items: countQuery,
          total_pages: getTotalPaginatedPages(query.limit, countQuery),
        };
      }
    }

    const countQuery = await dataCountQuery.exec();

    return {
      data: await dataQuery.exec(),
      page: query.page,
      total_items: countQuery,
      total_pages: getTotalPaginatedPages(query.limit, countQuery),
    };
  }

  async updateById(id: any, data: any): Promise<T> {
    return this.model.findOneAndUpdate({ _id: id }, data, { new: true });
  }

  async updateOne(filter: any, data: any): Promise<UpdateWriteOpResult> {
    return await this.model
      .updateOne(filter, data, { upsert: true })
      .exec();
  }

  async updateMany(filter: any, data: any): Promise<UpdateWriteOpResult> {
    return await this.model
      .updateMany(filter, data, { upsert: true })
      .exec();
  }

  /*async softDelete(id: number | string): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne({_id: id}, {deleted_at: new Date()});
  }*/

  async count(query: QueryOptions): Promise<number> {
    let dataQuery: any;

    let cacheKey = "";
    if (query.cache_key && query.cache_key.length) {
      cacheKey = query.cache_key;
    }

    if (query.filter) {
      dataQuery = this.model.countDocuments(query.filter);
      if (cacheKey && cacheKey.length) {
        cacheKey = `${cacheKey}_filter_${JSON.stringify(query.filter)}`;
      }
    } else {
      dataQuery = this.model.countDocuments({});
    }

    if (process.env.NODE_ENV === "production") {
      if (query.cache_time) {
        return dataQuery.cacheQuery({
          ttl: query.cache_time,
          ...(cacheKey && cacheKey.length && { cacheKey }),
        });
      }
    }

    return await dataQuery.exec();
  }
}
