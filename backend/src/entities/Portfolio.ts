import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { Asset } from './Asset';

@Entity('portfolios')
@Index(['name'])
@Index(['createdAt'])
@Unique(['name'])
export class Portfolio {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    length: 255,
    comment: 'Portfolio name'
  })
  name!: string;

  @Column({ 
    nullable: true,
    type: 'text',
    comment: 'Portfolio description'
  })
  description?: string;

  @OneToMany(() => Asset, asset => asset.portfolio, {
    cascade: true,
    eager: false
  })
  assets?: Asset[];

  @CreateDateColumn({
    comment: 'Portfolio creation timestamp'
  })
  createdAt!: Date;

  @UpdateDateColumn({
    comment: 'Portfolio last update timestamp'
  })
  updatedAt!: Date;

  // Calculated properties
  /**
   * Calculate total portfolio value
   */
  get totalValue(): number {
    if (!this.assets) return 0;
    return this.assets.reduce((sum, asset) => sum + asset.totalValue, 0);
  }

  /**
   * Calculate total unrealized profit/loss
   */
  get totalUnrealizedPnL(): number {
    if (!this.assets) return 0;
    return this.assets.reduce((sum, asset) => sum + asset.unrealizedPnL, 0);
  }

  /**
   * Calculate total unrealized profit/loss percentage
   */
  get totalUnrealizedPnLPercentage(): number {
    const totalCost = this.assets?.reduce((sum, asset) => sum + (asset.quantity * asset.purchasePrice), 0) || 0;
    if (totalCost === 0) return 0;
    return (this.totalUnrealizedPnL / totalCost) * 100;
  }

  /**
   * Get assets grouped by type
   */
  get assetsByType(): Record<string, number> {
    if (!this.assets) return {};
    return this.assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Calculate total cost basis
   */
  get totalCost(): number {
    if (!this.assets) return 0;
    return this.assets.reduce((sum, asset) => sum + asset.totalCost, 0);
  }

  /**
   * Get asset count
   */
  get assetCount(): number {
    return this.assets?.length || 0;
  }

  /**
   * Get profitable assets count
   */
  get profitableAssetsCount(): number {
    if (!this.assets) return 0;
    return this.assets.filter(asset => asset.isProfitable).length;
  }

  /**
   * Get assets by performance
   */
  get assetsByPerformance(): {
    profitable: Asset[];
    losing: Asset[];
    neutral: Asset[];
  } {
    if (!this.assets) return { profitable: [], losing: [], neutral: [] };

    return this.assets.reduce(
      (acc, asset) => {
        if (asset.unrealizedPnL > 0) {
          acc.profitable.push(asset);
        } else if (asset.unrealizedPnL < 0) {
          acc.losing.push(asset);
        } else {
          acc.neutral.push(asset);
        }
        return acc;
      },
      { profitable: [], losing: [], neutral: [] } as {
        profitable: Asset[];
        losing: Asset[];
        neutral: Asset[];
      }
    );
  }

  /**
   * Get portfolio performance summary
   */
  getPerformanceSummary() {
    const performance = this.assetsByPerformance;
    
    return {
      totalValue: this.totalValue,
      totalCost: this.totalCost,
      totalUnrealizedPnL: this.totalUnrealizedPnL,
      totalUnrealizedPnLPercentage: this.totalUnrealizedPnLPercentage,
      assetCount: this.assetCount,
      profitableAssetsCount: this.profitableAssetsCount,
      losingAssetsCount: performance.losing.length,
      neutralAssetsCount: performance.neutral.length,
      assetsByType: this.assetsByType,
      performance: performance,
    };
  }

  /**
   * Get portfolio summary
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.getPerformanceSummary(),
    };
  }
}
