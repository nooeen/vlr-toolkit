import { Injectable } from "@nestjs/common";
import { SkinRepository } from "./skin.repository";
import { BaseServiceAbstract } from "@app/share/services/base.service.abstract";
import { SkinModel } from "./skin.schema";

interface SkinData {
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

@Injectable()
export class SkinService extends BaseServiceAbstract<SkinModel> {
  constructor(private skinRepository: SkinRepository) {
    super(skinRepository);
  }

  async upsertSkin(uuid: string, skinData: SkinData): Promise<SkinModel> {
    try {
      // Try to find existing skin by uuid
      const existingSkin = await this.findOne({ filter: { uuid } });
      
      if (existingSkin) {
        // Update existing skin
        await this.updateOne(
          { uuid },
          {
            ...skinData,
            updated_at: Date.now(),
          }
        );
        
        // Return the updated document
        return await this.findOne({ filter: { uuid } });
      } else {
        // Create new skin
        return await this.create({
          ...skinData,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
    } catch (error) {
      throw new Error(`Failed to upsert skin ${uuid}: ${error.message}`);
    }
  }

  async getSkinByUuid(uuid: string): Promise<SkinModel | null> {
    return await this.findOne({ filter: { uuid } });
  }

  async getAllSkins(): Promise<SkinModel[]> {
    return await this.find({ filter: {} });
  }

  async getSkinsByTheme(themeUuid: string): Promise<SkinModel[]> {
    return await this.find({ filter: { themeUuid } });
  }
}
