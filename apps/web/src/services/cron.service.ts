import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SkinService } from "libs/skins/src";
import { ContentTierService } from "libs/contenttiers/src";
import axios, { AxiosResponse } from "axios";

interface ValorantSkin {
  uuid: string;
  displayName: string;
  themeUuid: string;
  contentTierUuid: string;
  displayIcon: string;
  wallpaper: string;
  assetPath: string;
  chromas: {
    uuid: string;
    displayName: string;
    displayIcon: string;
    fullRender: string;
    swatch: string;
    streamedVideo: string;
    assetPath: string;
  }[];
  levels: {
    uuid: string;
    displayName: string;
    levelItem: string;
    displayIcon: string;
    streamedVideo: string;
    assetPath: string;
  }[];
}

interface ValorantApiResponse {
  status: number;
  data: ValorantSkin[];
}

interface ValorantContentTier {
  uuid: string;
  displayName: string;
  devName: string;
  rank: number;
  juiceValue: number;
  juiceCost: number;
  highlightColor: string;
  displayIcon: string;
  assetPath: string;
}

interface ValorantContentTierApiResponse {
  status: number;
  data: ValorantContentTier[];
}

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly VALORANT_API_URL = 'https://valorant-api.com/v1/weapons/skins?language=vi-VN';
  private readonly VALORANT_CONTENTTIERS_API_URL = 'https://valorant-api.com/v1/contenttiers?language=vi-VN';

  constructor(
    private readonly skinService: SkinService,
    private readonly contentTierService: ContentTierService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchAndUpdateSkins(): Promise<void> {
    this.logger.log('Starting daily skin data fetch from Valorant API');
    
    try {
      const response: AxiosResponse<ValorantApiResponse> = await axios.get(this.VALORANT_API_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'VLR-Toolkit/1.0',
        },
      });

      if (response.data.status !== 200) {
        throw new Error(`API returned status: ${response.data.status}`);
      }

      const skins = response.data.data;
      this.logger.log(`Fetched ${skins.length} skins from Valorant API`);

      let processedCount = 0;
      let errorCount = 0;

      // Process skins in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < skins.length; i += batchSize) {
        const batch = skins.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(async (skinData) => {
            try {
              await this.skinService.upsertSkin(skinData.uuid, skinData);
              processedCount++;
            } catch (error) {
              errorCount++;
              this.logger.error(`Failed to upsert skin ${skinData.uuid}: ${error.message}`);
            }
          })
        );

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.logger.log(`Skin sync completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    } catch (error) {
      this.logger.error(`Failed to fetch skin data from Valorant API: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Manual trigger for testing or emergency updates
  async forceSkinUpdate(): Promise<void> {
    this.logger.log('Force triggering skin data update');
    await this.fetchAndUpdateSkins();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async fetchAndUpdateContentTiers(): Promise<void> {
    this.logger.log('Starting daily content tier data fetch from Valorant API');
    
    try {
      const response: AxiosResponse<ValorantContentTierApiResponse> = await axios.get(this.VALORANT_CONTENTTIERS_API_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'VLR-Toolkit/1.0',
        },
      });

      if (response.data.status !== 200) {
        throw new Error(`API returned status: ${response.data.status}`);
      }

      const contentTiers = response.data.data;
      this.logger.log(`Fetched ${contentTiers.length} content tiers from Valorant API`);

      let processedCount = 0;
      let errorCount = 0;

      // Process content tiers
      await Promise.allSettled(
        contentTiers.map(async (contentTierData) => {
          try {
            await this.contentTierService.upsertContentTier(contentTierData.uuid, contentTierData);
            processedCount++;
          } catch (error) {
            errorCount++;
            this.logger.error(`Failed to upsert content tier ${contentTierData.uuid}: ${error.message}`);
          }
        })
      );

      this.logger.log(`Content tier sync completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    } catch (error) {
      this.logger.error(`Failed to fetch content tier data from Valorant API: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Manual trigger for testing or emergency updates
  async forceContentTierUpdate(): Promise<void> {
    this.logger.log('Force triggering content tier data update');
    await this.fetchAndUpdateContentTiers();
  }
}