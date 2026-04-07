import { Injectable, BadRequestException } from '@nestjs/common';
import { SkinService } from 'libs/skins/src';
import { ContentTierService } from 'libs/contenttiers/src';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import * as puppeteer from 'puppeteer';

export interface InventoryData {
  info: {
    vPoint: number;
    rPoint: number;
    otherPoint: number;
  };
  categories: any[];
  batches: any[];
  totalItems: number;
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly skinService: SkinService,
    private readonly contentTierService: ContentTierService,
  ) {}

  async getUserInventory(accessToken: string): Promise<InventoryData> {
    try {
      // Get entitlements token
      const entitlementsToken = await this.getEntitlementsToken(accessToken);
      
      // Setup headers for Riot API
      const headers = {
        'X-Riot-Entitlements-JWT': entitlementsToken,
        'Authorization': `Bearer ${accessToken}`,
        'X-Riot-ClientVersion': 'release-05.12-shipping-21-808353',
        'X-Riot-ClientPlatform': 'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9',
      };

      // Decode token to get UUID
      const decoded = jwt.decode(entitlementsToken) as any;
      const uuid = decoded.sub;

      // Get wallet
      const wallet = await this.getWallet(uuid, headers);
      
      // Get user items (skins)
      const typeId = "e7c63390-eda7-46e0-bb7a-a6abdacd2433"; // Skin type ID
      const items = await this.getOwnerItems(uuid, typeId, headers);
      
      // Process items to get detailed information
      const list = [];
      for (const item of items) {
        const detail = await this.getDetailByItemId(item.ItemID);
        if (detail) {
          const checkExist = list.find((tem) => tem.uuid === detail.uuid);
          if (!checkExist) list.push(detail);
        }
      }

      // Group by category
      const categories = _.chain(list)
        .groupBy("category")
        .map((items, category) => ({
          category,
          items: _.orderBy(items, ["rank"], ["desc"]),
        }))
        .value();

      // Split into batches
      const batches = this.splitCategoriesIntoBatches(categories);

      return {
        info: {
          vPoint: wallet.Balances["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"] || 0,
          rPoint: wallet.Balances["e59aa87c-4cbf-517a-5983-6e81511be9b7"] || 0,
          otherPoint: wallet.Balances["85ca954a-41f2-ce94-9b45-8ca3dd39a00d"] || 0,
        },
        categories,
        batches,
        totalItems: list.length
      };
    } catch (error) {
      console.error('Error getting user inventory:', error);
      throw new BadRequestException('Failed to get user inventory: ' + error.message);
    }
  }

  generateHTMLByCategoryItems(categoriesItems: any[]): string {
    // CSS for the inventory display
    const css = `
      <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: white;
        position: relative;
        background: url('https://vlr-toolkit-asset.autodx.click/vlr-bg.png') no-repeat center center;
        background-size: cover;
        background-attachment: scroll;
      }
  
      .container {
        display: flex;
        justify-content: space-around;
        padding: 20px;
        flex-wrap: wrap;
      }
  
      .column {
        width: 150px;
        margin: 10px;
      }
  
      h2 {
        text-align: center;
        font-size: 18px;
        margin-bottom: 10px;
        border-bottom: 2px solid white;
        padding-bottom: 5px;
      }
  
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 10px;
        margin: 10px 0;
        border-radius: 10px;
        text-align: center;
        border: 2px solid transparent;
        transition: border 0.3s ease-in-out;
      }
  
      .item:hover {
        border: 2px solid white;
      }
  
      .item img {
        width: 160px;
        height: 80px;
        object-fit: contain;
        margin-bottom: 10px;
      }
  
      .item p {
        margin: 0;
        font-size: 20px;
      }
      </style>
    `;

    // Build HTML
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Valorant Inventory Display</title>
        ${css}
      </head>
      <body>
        <div class="container">
    `;

    // Generate HTML for each category
    categoriesItems.forEach((category) => {
      html += `<div class="column">
                 <h2>${category.categoryName}</h2>`;

      category.items.forEach((item) => {
        html += `<div class="item" style="background-color: ${
          item.backgroundColor || "rgba(255, 255, 255, 0.1)"
        };">
          <img src="${item.displayIcon}" alt="${item.displayName}">
          <p>${item.displayName}</p>
        </div>`;
      });

      html += `</div>`;
    });

    html += `
        </div>
      </body>
      </html>
    `;

    return html;
  }

  generateInfoHTML(info: any): string {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Player Info</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: white;
            position: relative;
            background: url("https://vlr-toolkit-asset.autodx.click/vlr-bg.png") no-repeat center center;
            background-size: cover;
            background-attachment: scroll;
            height: 100vh;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .player-info-container {
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
          }
          
          .player-header h2 {
            margin-bottom: 20px;
            font-size: 24px;
            border-bottom: 2px solid white;
            padding-bottom: 10px;
          }
          
          .icon {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.1);
            margin: 10px 0;
            padding: 15px;
            border-radius: 10px;
            font-size: 18px;
          }
          
          .icon span:first-child {
            font-weight: bold;
          }
          
          .icon span:last-child {
            color: #ffcc00;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="player-info-container">
          <div class="player-info">
            <div class="player-header">
              <h2>Thông tin account</h2>
            </div>
            <div class="icons">
              <div class="icon">
                <span>V Points</span>
                <span>${info.vPoint}</span>
              </div>
              <div class="icon">
                <span>R Points</span>
                <span>${info.rPoint}</span>
              </div>
              <div class="icon">
                <span>Other Point</span>
                <span>${info.otherPoint}</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }

  async captureInventoryScreenshot(accessToken: string, batchIndex: number = 0): Promise<string> {
    try {
      const inventoryData = await this.getUserInventory(accessToken);
      const batchData = inventoryData.batches[batchIndex] || inventoryData.batches[0];
      
      if (!batchData) {
        throw new BadRequestException('No inventory data found for screenshot');
      }

      const html = this.generateHTMLByCategoryItems(batchData);
      return await this.captureHTMLScreenshot(html);
    } catch (error) {
      console.error('Error capturing inventory screenshot:', error);
      throw new BadRequestException('Failed to capture inventory screenshot: ' + error.message);
    }
  }

  async captureInfoScreenshot(accessToken: string): Promise<string> {
    try {
      const inventoryData = await this.getUserInventory(accessToken);
      const html = this.generateInfoHTML(inventoryData.info);
      return await this.captureHTMLScreenshot(html);
    } catch (error) {
      console.error('Error capturing info screenshot:', error);
      throw new BadRequestException('Failed to capture info screenshot: ' + error.message);
    }
  }

  private async captureHTMLScreenshot(html: string): Promise<string> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
      });

      // Set content and wait for all resources to load
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });

      // Take screenshot and convert to base64
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png',
        encoding: 'base64',
      });

      await page.close();
      
      return `data:image/png;base64,${screenshot}`;
    } finally {
      await browser.close();
    }
  }

  async captureAllScreenshots(accessToken: string): Promise<{
    infoScreenshot: string;
    inventoryScreenshots: Array<{ batchIndex: number; image: string; }>;
    totalBatches: number;
  }> {
    try {
      // Get inventory data
      const inventoryData = await this.getUserInventory(accessToken);
      
      // Capture info screenshot
      const infoHtml = this.generateInfoHTML(inventoryData.info);
      const infoScreenshot = await this.captureHTMLScreenshot(infoHtml);
      
      // Capture all batch screenshots
      const inventoryScreenshots = [];
      for (let i = 0; i < inventoryData.batches.length; i++) {
        const batchData = inventoryData.batches[i];
        const html = this.generateHTMLByCategoryItems(batchData);
        const image = await this.captureHTMLScreenshot(html);
        
        inventoryScreenshots.push({
          batchIndex: i,
          image: image
        });
      }

      return {
        infoScreenshot,
        inventoryScreenshots,
        totalBatches: inventoryData.batches.length
      };
    } catch (error) {
      console.error('Error capturing all screenshots:', error);
      throw new BadRequestException('Failed to capture all screenshots: ' + error.message);
    }
  }

  private async getEntitlementsToken(accessToken: string): Promise<string> {
    const response = await axios.post(
      'https://entitlements.auth.riotgames.com/api/token/v1',
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.entitlements_token;
  }

  private async getWallet(uuid: string, headers: any) {
    const response = await axios.get(
      `https://pd.ap.a.pvp.net/store/v1/wallet/${uuid}`,
      { headers }
    );
    return response.data;
  }

  private async getOwnerItems(uuid: string, itemTypeId: string, headers: any) {
    const response = await axios.get(
      `https://pd.ap.a.pvp.net/store/v1/entitlements/${uuid}/${itemTypeId}`,
      { headers }
    );
    return response?.data?.Entitlements || [];
  }

  private extractNextSegment(path: string): string | null {
    const regex = /Equippables\/[^\/]+\/([^\/]+)\/?/;
    const match = path.match(regex);
    return match ? match[1] : null;
  }

  private async getDetailByItemId(itemId: string) {
    try {
      // Find skin that has this item ID in its levels
      const skins = await this.skinService.find({
        filter: {
          'levels.uuid': itemId
        }
      });

      if (!skins.length) {
        return null;
      }

      const detailSkin = skins[0];
      
      // Get content tier info
      const tier = await this.contentTierService.findOne({
        filter: { uuid: detailSkin.contentTierUuid }
      });

      // Find the specific level
      const level = detailSkin.levels.find(l => l.uuid === itemId);
      
      if (!level) {
        return null;
      }

      return {
        displayName: level.displayName,
        tier: tier?.devName || 'Unknown',
        displayIcon: level.displayIcon || detailSkin.displayIcon,
        category: this.extractNextSegment(detailSkin.assetPath),
        backgroundColor: tier ? `#${tier.highlightColor}` : '#ffffff',
        rank: tier?.rank || 0,
        uuid: detailSkin.uuid,
      };
    } catch (error) {
      console.error('Error getting detail by item ID:', error);
      return null;
    }
  }

  private splitCategoriesIntoBatches(categories: any[]): any[] {
    const maxCategoriesPerBatch = 5;
    const maxItemsPerCategory = 5;

    let result = [];
    let currentBatch = [];

    categories.forEach((category) => {
      let remainingItems = [...category.items];

      while (remainingItems.length > 0) {
        const newCategory = {
          categoryName: category.category,
          items: remainingItems.slice(0, maxItemsPerCategory),
        };

        currentBatch.push(newCategory);
        remainingItems = remainingItems.slice(maxItemsPerCategory);

        if (currentBatch.length === maxCategoriesPerBatch) {
          result.push(currentBatch);
          currentBatch = [];
        }
      }
    });

    if (currentBatch.length > 0) {
      result.push(currentBatch);
    }

    return result;
  }
}