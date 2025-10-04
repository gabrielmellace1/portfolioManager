import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Asset } from './Asset';

@Entity('price_history')
@Index(['asset', 'date'], { unique: true }) // Ensure one price per asset per day
export class PriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Asset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'asset_id' })
  assetId: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD format

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt: Date;

  // Optional: Store additional metadata
  @Column({ type: 'json', nullable: true })
  metadata?: {
    source?: string; // 'coingecko', 'yahoo', etc.
    volume24h?: number;
    marketCap?: number;
    change24h?: number;
  };
}
