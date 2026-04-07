import { Request } from "express";

export type ExtraRequestInfo = {
  origin: string;
  href: string;
};
export type CustomRequest = ExtraRequestInfo & Request;
