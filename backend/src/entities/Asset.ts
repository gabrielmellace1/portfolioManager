import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { Portfolio } from './Portfolio';

export enum AssetType {
  STOCK = 'stock',
  OPTION = 'option',
  BOND = 'bond',
  CRYPTO = 'crypto',
  CASH = 'cash'
}

export enum OptionType {
  CALL = 'call',
  PUT = 'put'
}

@Entity('assets')
@Index(['portfolioId', 'type'])
@Index(['ticker'])
@Index(['createdAt'])
@Check(`"quantity" > 0`)
@Check(`"purchasePrice" > 0`)
@Check(`"currentPrice" IS NULL OR "currentPrice" > 0`)
export class Asset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ 
    type: 'varchar',
    length: 20,
    comment: 'Type of asset (stock, option, bond, crypto, cash)'
  })
  type!: AssetType;

  @Column({ 
    length: 10,
    comment: 'Stock ticker symbol'
  })
  ticker!: string;

  @Column('decimal', { 
    precision: 15, 
    scale: 8,
    comment: 'Quantity of the asset'
  })
  quantity!: number;

  @Column('decimal', { 
    precision: 15, 
    scale: 4,
    comment: 'Purchase price per unit'
  })
  purchasePrice!: number;

  @Column('decimal', { 
    precision: 15, 
    scale: 4, 
    nullable: true,
    comment: 'Current market price per unit'
  })
  currentPrice?: number;

  @Column({ 
    nullable: true,
    length: 255,
    comment: 'Human-readable name of the asset'
  })
  name?: string;

  @Column({ 
    nullable: true,
    type: 'text',
    comment: 'Description of the asset'
  })
  description?: string;

  // For options
  @Column('decimal', { 
    precision: 15, 
    scale: 4, 
    nullable: true,
    comment: 'Strike price for options'
  })
  strikePrice?: number;

  @Column({ 
    nullable: true,
    comment: 'Expiration date for options'
  })
  expirationDate?: Date;

  @Column({ 
    nullable: true,
    type: 'varchar',
    length: 4,
    comment: 'Option type (call or put)'
  })
  optionType?: OptionType;

  // For bonds
  @Column('decimal', { 
    precision: 5, 
    scale: 4, 
    nullable: true,
    comment: 'Coupon rate for bonds (as decimal)'
  })
  couponRate?: number;

  @Column({ 
    nullable: true,
    comment: 'Maturity date for bonds'
  })
  maturityDate?: Date;

  @Column('decimal', { 
    precision: 15, 
    scale: 4, 
    nullable: true,
    comment: 'Face value for bonds'
  })
  faceValue?: number;

  // For crypto
  @Column({ 
    nullable: true,
    length: 20,
    comment: 'Cryptocurrency symbol'
  })
  symbol?: string;

  // Portfolio relationship
  @ManyToOne(() => Portfolio, portfolio => portfolio.assets, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'portfolioId' })
  portfolio?: Portfolio;

  @Column({
    comment: 'Foreign key to portfolio'
  })
  portfolioId!: number;

  // Metadata
  @CreateDateColumn({
    comment: 'Record creation timestamp'
  })
  createdAt!: Date;

  @UpdateDateColumn({
    comment: 'Record last update timestamp'
  })
  updatedAt!: Date;

  // Calculated properties
  /**
   * Calculate total value of the asset
   */
  get totalValue(): number {
    const baseValue = this.quantity * (this.currentPrice || this.purchasePrice);
    
    // For options, multiply by 100 since 1 contract = 100 shares
    if (this.type === AssetType.OPTION) {
      return baseValue * 100;
    }
    
    return baseValue;
  }

  /**
   * Calculate unrealized profit/loss
   */
  get unrealizedPnL(): number {
    if (!this.currentPrice) return 0;
    const basePnL = (this.currentPrice - this.purchasePrice) * this.quantity;
    
    // For options, multiply by 100 since 1 contract = 100 shares
    if (this.type === AssetType.OPTION) {
      return basePnL * 100;
    }
    
    return basePnL;
  }

  /**
   * Calculate unrealized profit/loss percentage
   */
  get unrealizedPnLPercentage(): number {
    if (!this.currentPrice) return 0;
    return ((this.currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
  }

  /**
   * Calculate total cost basis
   */
  get totalCost(): number {
    return this.quantity * this.purchasePrice;
  }

  /**
   * Check if asset is profitable
   */
  get isProfitable(): boolean {
    return this.unrealizedPnL > 0;
  }

  /**
   * Get days until expiration (for options)
   */
  get daysUntilExpiration(): number | null {
    if (this.type !== AssetType.OPTION || !this.expirationDate) {
      return null;
    }
    
    const now = new Date();
    const diffTime = this.expirationDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if option is expired
   */
  get isExpired(): boolean {
    if (this.type !== AssetType.OPTION || !this.expirationDate) {
      return false;
    }
    
    return new Date() > this.expirationDate;
  }

  /**
   * Get asset summary
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      ticker: this.ticker,
      name: this.name,
      quantity: this.quantity,
      purchasePrice: this.purchasePrice,
      currentPrice: this.currentPrice,
      totalValue: this.totalValue,
      totalCost: this.totalCost,
      unrealizedPnL: this.unrealizedPnL,
      unrealizedPnLPercentage: this.unrealizedPnLPercentage,
      isProfitable: this.isProfitable,
      ...(this.type === AssetType.OPTION && {
        strikePrice: this.strikePrice,
        expirationDate: this.expirationDate,
        optionType: this.optionType,
        daysUntilExpiration: this.daysUntilExpiration,
        isExpired: this.isExpired,
      }),
    };
  }
}
