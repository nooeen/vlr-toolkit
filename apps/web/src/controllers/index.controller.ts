import {
  HEADER_CACHE_30_MINUTES,
} from "@app/share/constants";
import {
  Controller,
  Get,
  Header,
  Req,
  Res,
  Post,
  Body,
} from "@nestjs/common";
import { CacheService } from "@app/share/cache/cache.service";
import { CustomRequest } from "../types/custom-request.type";
import { CustomResponse } from "../types/custom-response.type";
import { InventoryService } from "../services/inventory.service";
import { AccessTokenDto } from "../dto/inventory.dto";

const view = "page/index";

@Controller()
export class IndexController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Get()
  @Header("Cache-Control", HEADER_CACHE_30_MINUTES)
  async index(
    @Req() req: CustomRequest,
    @Res() res: CustomResponse
  ) {
    
    const cacheKey = `index_page}`;

    let html;

    html = await this.cacheService.getCache(cacheKey);
    if (html) return res.send(html);
    
    const data = {
      view,
      origin: `${req.protocol}://${req.get('host')}`,
      version: Date.now(), // Simple versioning for cache busting
    };

    return res.sendAndCacheEjs(cacheKey, data);
  }

  @Post('inventory/capture-all')
  async captureAllScreenshots(@Body() body: AccessTokenDto) {
    const screenshots = await this.inventoryService.captureAllScreenshots(body.accessToken);
    
    return {
      success: true,
      data: {
        infoScreenshot: screenshots.infoScreenshot,
        inventoryScreenshots: screenshots.inventoryScreenshots,
        totalBatches: screenshots.totalBatches
      }
    };
  }
}
