import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Response } from "express";
import { Observable, map } from "rxjs";

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<unknown> {
    const response = context.switchToHttp().getResponse<Response>();
    const status = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        if (data.data && data.pagination) {
          return {
            message: "success",
            status,
            data: data.data,
            pagination: data.pagination,
          };
        }

        return {
          message: "success",
          status,
          data,
        };
      })
    );
  }
}
