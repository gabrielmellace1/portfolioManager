import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PriceHistory } from '../entities/PriceHistory';
import { Asset } from '../entities/Asset';

export class PriceHistoryRepository {
  private repository: Repository<PriceHistory>;

  constructor() {
    this.repository = AppDataSource.getRepository(PriceHistory);
  }

  /**
   * Store a price for a specific asset and date
   */
  async storePrice(assetId: number, price: number, date: string, metadata?: any): Promise<PriceHistory> {
    // Check if price already exists for this asset and date
    const existing = await this.repository.findOne({
      where: { assetId, date }
    });

    if (existing) {
      // Update existing price
      existing.price = price;
      existing.metadata = metadata;
      return await this.repository.save(existing);
    } else {
      // Create new price record
      const priceHistory = this.repository.create({
        assetId,
        price,
        date,
        metadata
      });
      return await this.repository.save(priceHistory);
    }
  }

  /**
   * Get the most recent price for an asset before a given date
   */
  async getPreviousPrice(assetId: number, beforeDate: string): Promise<PriceHistory | null> {
    return await this.repository.findOne({
      where: { assetId },
      order: { date: 'DESC' },
      // Add condition to get price before the given date
    });
  }

  /**
   * Get price for a specific asset and date
   */
  async getPriceForDate(assetId: number, date: string): Promise<PriceHistory | null> {
    return await this.repository.findOne({
      where: { assetId, date }
    });
  }

  /**
   * Get price history for an asset within a date range
   */
  async getPriceHistory(assetId: number, startDate: string, endDate: string): Promise<PriceHistory[]> {
    return await this.repository.find({
      where: {
        assetId,
        date: {
          $gte: startDate,
          $lte: endDate
        } as any
      },
      order: { date: 'ASC' }
    });
  }

  /**
   * Get the latest price for an asset
   */
  async getLatestPrice(assetId: number): Promise<PriceHistory | null> {
    return await this.repository.findOne({
      where: { assetId },
      order: { date: 'DESC' }
    });
  }

  /**
   * Clean up old price history (keep only last N days)
   */
  async cleanupOldPrices(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('date < :cutoffDate', { cutoffDate: cutoffDate.toISOString().split('T')[0] })
      .execute();
    
    return result.affected || 0;
  }
}
