import { Injectable } from "@nestjs/common";
import { ContentTierRepository } from "./contenttier.repository";
import { BaseServiceAbstract } from "@app/share/services/base.service.abstract";
import { ContentTierModel } from "./contenttier.schema";

interface ContentTierData {
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

@Injectable()
export class ContentTierService extends BaseServiceAbstract<ContentTierModel> {
  constructor(private contentTierRepository: ContentTierRepository) {
    super(contentTierRepository);
  }

  async upsertContentTier(uuid: string, contentTierData: ContentTierData): Promise<ContentTierModel> {
    try {
      // Try to find existing content tier by uuid
      const existingContentTier = await this.findOne({ filter: { uuid } });
      
      if (existingContentTier) {
        // Update existing content tier
        await this.updateOne(
          { uuid },
          {
            ...contentTierData,
            updated_at: Date.now(),
          }
        );
        
        // Return the updated document
        return await this.findOne({ filter: { uuid } });
      } else {
        // Create new content tier
        return await this.create({
          ...contentTierData,
          created_at: Date.now(),
          updated_at: Date.now(),
        });
      }
    } catch (error) {
      throw new Error(`Failed to upsert content tier ${uuid}: ${error.message}`);
    }
  }

  async getContentTierByUuid(uuid: string): Promise<ContentTierModel | null> {
    return await this.findOne({ filter: { uuid } });
  }

  async getAllContentTiers(): Promise<ContentTierModel[]> {
    return await this.find({ filter: {} });
  }

  async getContentTiersByRank(rank: number): Promise<ContentTierModel[]> {
    return await this.find({ filter: { rank } });
  }
}
