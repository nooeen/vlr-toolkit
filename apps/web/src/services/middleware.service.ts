import { Injectable, NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NextFunction } from "express";
import * as ejs from "ejs";
import { ShareService } from "@app/share";
import { CacheService } from "@app/share/cache/cache.service";
import { CustomRequest } from "../types/custom-request.type";
import { CustomResponse } from "../types/custom-response.type";
import { WEB_VERSION, PATHS } from "../constants";

@Injectable()
export class MiddlewareService implements NestMiddleware {
  constructor(
    // private reflector: Reflector,
    private readonly shareService: ShareService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {}

  async use(req: CustomRequest, res: CustomResponse, next: NextFunction) {
    try {
      res.sendAndCacheEjs = async (
        cacheKey: string,
        data: any = {},
        page: number = 1,
        status = 200,
        layout = `${process.cwd()}/views/web/layout.ejs`
      ): Promise<void> => {
        let html = await ejs.renderFile(layout, {
          version: WEB_VERSION,
          paths: PATHS,
          env: this.configService.get("NODE_ENV"),
          url: req.originalUrl,
          path: req.path,
          page,
          origin: req.origin,
          href: req.href,
          ...data,
        });

        html = this.shareService.minifyPage(html);

        await this.cacheService.setCache(html, cacheKey);

        res.status(status).send(html);
      };
    } catch (error) {
      console.log(error);
    }

    next();
  }
}
