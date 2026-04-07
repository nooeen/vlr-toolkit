/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import * as consts from "./constants";
import * as minifier from "html-minifier";
import * as _ from "lodash";

@Injectable()
export class ShareService {
  constructor() {}

  minifyPage(html) {
    if (consts.MINIFY_PAGE || process.env.NODE_ENV === "production") {
      return minifier.minify(html, {
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
        removeComments: true,
      });
    }
    return html;
  }

}
