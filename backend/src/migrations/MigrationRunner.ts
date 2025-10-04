import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/Logger';

export interface Migration {
  version: string;
  name: string;
  filename: string;
  executed: boolean;
  executedAt?: Date;
}

/**
 * Database migration runner
 */
export class MigrationRunner {
  private dataSource: DataSource;
  private migrationsPath: string;

  constructor(dataSource: DataSource, migrationsPath: string = 'src/migrations') {
    this.dataSource = dataSource;
    this.migrationsPath = migrationsPath;
  }

  /**
   * Initialize migration tracking table
   */
  private async initializeMigrationTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.dataSource.query(query);
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<Migration[]> {
    const query = `
      SELECT version, name, filename, executed_at as executedAt
      FROM migrations 
      ORDER BY version
    `;

    const results = await this.dataSource.query(query);
    return results.map((row: any) => ({
      version: row.version,
      name: row.name,
      filename: row.filename,
      executed: true,
      executedAt: new Date(row.executedAt),
    }));
  }

  /**
   * Get list of available migration files
   */
  private getAvailableMigrations(): Migration[] {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter((file: string) => file.endsWith('.sql'))
        .sort();

      return files.map((file: string) => {
        const match = file.match(/^(\d+)_(.+)\.sql$/);
        if (match) {
          return {
            version: match[1],
            name: match[2].replace(/_/g, ' '),
            filename: file,
            executed: false,
          };
        }
        return null;
      }).filter(Boolean) as Migration[];
    } catch (error) {
      logger.warn('Could not read migrations directory', { path: this.migrationsPath, error });
      return [];
    }
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(migration: Migration): Promise<void> {
    const filePath = join(this.migrationsPath, migration.filename);
    
    try {
      const sql = readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await this.dataSource.query(statement);
        }
      }

      // Record migration as executed
      await this.dataSource.query(`
        INSERT INTO migrations (version, name, filename, executed_at)
        VALUES (?, ?, ?, ?)
      `, [migration.version, migration.name, migration.filename, new Date().toISOString()]);

      logger.info('Migration executed successfully', {
        version: migration.version,
        name: migration.name,
        filename: migration.filename,
      });
    } catch (error) {
      logger.error('Migration execution failed', {
        version: migration.version,
        name: migration.name,
        filename: migration.filename,
        error,
      });
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      await this.initializeMigrationTable();
      
      const executedMigrations = await this.getExecutedMigrations();
      const availableMigrations = this.getAvailableMigrations();
      
      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.some(executed => executed.version === migration.version)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      for (const migration of pendingMigrations) {
        logger.info(`Executing migration: ${migration.version} - ${migration.name}`);
        await this.executeMigration(migration);
      }

      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed', { error });
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    executed: Migration[];
    pending: Migration[];
    total: number;
  }> {
    await this.initializeMigrationTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const availableMigrations = this.getAvailableMigrations();
    
    const pendingMigrations = availableMigrations.filter(
      migration => !executedMigrations.some(executed => executed.version === migration.version)
    );

    return {
      executed: executedMigrations,
      pending: pendingMigrations,
      total: availableMigrations.length,
    };
  }

  /**
   * Rollback last migration (if supported)
   */
  async rollbackLastMigration(): Promise<void> {
    logger.warn('Rollback functionality not implemented for SQLite migrations');
    throw new Error('Rollback functionality not supported');
  }

  /**
   * Check if migrations are needed
   */
  async needsMigration(): Promise<boolean> {
    const status = await this.getMigrationStatus();
    return status.pending.length > 0;
  }
}
