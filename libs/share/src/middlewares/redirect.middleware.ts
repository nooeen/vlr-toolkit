import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path !== "/" && req.path.endsWith("/")) {
      const query = req.url.slice(req.path.length);
      return res.redirect(301, req.path.slice(0, -1) + query);
    } else {
      next();
    }
  }
}
