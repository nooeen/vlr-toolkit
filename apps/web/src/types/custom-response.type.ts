import { Response } from "express";

export type ExtraResponseInfo = {
  sendAndCacheEjs: (
    cacheKey: string,
    data: any,
    page?: number,
    status?: number,
    layout?: string
  ) => void;
};
export type CustomResponse = ExtraResponseInfo & Response;
