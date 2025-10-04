import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsPositive, Min, Max, Length, Matches } from 'class-validator';
import { AssetType } from '../entities/Asset';

/**
 * Base validation decorators for common patterns
 */
export const IsTicker = () => Matches(/^[A-Z]{1,5}$/, { message: 'Ticker must be 1-5 uppercase letters' });
export const IsPositiveNumber = () => [IsNumber(), IsPositive()];
export const IsOptionalString = () => [IsOptional(), IsString()];
export const IsOptionalNumber = () => [IsOptional(), IsNumber()];

/**
 * Asset creation validation DTO
 */
export class CreateAssetDto {
  @IsEnum(AssetType, { message: 'Invalid asset type' })
  type!: AssetType;

  @IsNotEmpty({ message: 'Ticker is required' })
  @IsTicker()
  ticker!: string;

  @IsNotEmpty({ message: 'Quantity is required' })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity!: number;

  @IsNotEmpty({ message: 'Purchase price is required' })
  @IsNumber({}, { message: 'Purchase price must be a number' })
  @IsPositive({ message: 'Purchase price must be positive' })
  purchasePrice!: number;

  @IsNotEmpty({ message: 'Portfolio ID is required' })
  @IsNumber({}, { message: 'Portfolio ID must be a number' })
  @IsPositive({ message: 'Portfolio ID must be positive' })
  portfolioId!: number;

  @IsOptional()
  @IsDateString({}, { message: 'Purchase date must be a valid date' })
  purchaseDate?: string | Date;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000, { message: 'Description must be between 1 and 1000 characters' })
  description?: string;

  // Option-specific fields
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Strike price must be positive' })
  strikePrice?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid date' })
  expirationDate?: string | Date;

  @IsOptional()
  @IsEnum(['call', 'put'], { message: 'Option type must be call or put' })
  optionType?: 'call' | 'put';

  // Bond-specific fields
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Coupon rate must be non-negative' })
  @Max(100, { message: 'Coupon rate must be less than 100%' })
  couponRate?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Maturity date must be a valid date' })
  maturityDate?: string | Date;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Face value must be positive' })
  faceValue?: number;

  // Crypto-specific fields
  @IsOptional()
  @IsString()
  @Length(1, 20, { message: 'Symbol must be between 1 and 20 characters' })
  symbol?: string;
}

/**
 * Asset update validation DTO
 */
export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(AssetType, { message: 'Invalid asset type' })
  type?: AssetType;

  @IsOptional()
  @IsTicker()
  ticker?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsPositive({ message: 'Quantity must be positive' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Purchase price must be a number' })
  @IsPositive({ message: 'Purchase price must be positive' })
  purchasePrice?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000, { message: 'Description must be between 1 and 1000 characters' })
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Current price must be positive' })
  currentPrice?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Purchase date must be a valid date' })
  purchaseDate?: string | Date;

  // Option-specific fields
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Strike price must be positive' })
  strikePrice?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Expiration date must be a valid date' })
  expirationDate?: string | Date;

  @IsOptional()
  @IsEnum(['call', 'put'], { message: 'Option type must be call or put' })
  optionType?: 'call' | 'put';

  // Bond-specific fields
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Coupon rate must be non-negative' })
  @Max(100, { message: 'Coupon rate must be less than 100%' })
  couponRate?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Maturity date must be a valid date' })
  maturityDate?: string | Date;

  @IsOptional()
  @IsNumber()
  @IsPositive({ message: 'Face value must be positive' })
  faceValue?: number;

  // Crypto-specific fields
  @IsOptional()
  @IsString()
  @Length(1, 20, { message: 'Symbol must be between 1 and 20 characters' })
  symbol?: string;
}

/**
 * Portfolio creation validation DTO
 */
export class CreatePortfolioDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000, { message: 'Description must be between 1 and 1000 characters' })
  description?: string;
}

/**
 * Portfolio update validation DTO
 */
export class UpdatePortfolioDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 1000, { message: 'Description must be between 1 and 1000 characters' })
  description?: string;
}

/**
 * Query parameters validation DTO
 */
export class QueryParamsDto {
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be at most 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort must be a string' })
  sort?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Order must be asc or desc' })
  order?: 'asc' | 'desc' = 'asc';
}
