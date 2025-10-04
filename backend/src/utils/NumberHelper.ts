/**
 * Number utility functions
 */
export class NumberHelper {
  /**
   * Round number to specified decimal places
   */
  static round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Format number as currency
   */
  static formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  }

  /**
   * Format number as percentage
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${this.round(value, decimals)}%`;
  }

  /**
   * Format number with thousand separators
   */
  static formatNumber(value: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(value);
  }

  /**
   * Calculate percentage change between two values
   */
  static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Calculate compound interest
   */
  static calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundingFrequency: number = 1
  ): number {
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
  }

  /**
   * Calculate present value
   */
  static calculatePresentValue(futureValue: number, rate: number, time: number): number {
    return futureValue / Math.pow(1 + rate, time);
  }

  /**
   * Calculate future value
   */
  static calculateFutureValue(presentValue: number, rate: number, time: number): number {
    return presentValue * Math.pow(1 + rate, time);
  }

  /**
   * Calculate annuity payment
   */
  static calculateAnnuityPayment(
    presentValue: number,
    rate: number,
    periods: number
  ): number {
    if (rate === 0) return presentValue / periods;
    return (presentValue * rate * Math.pow(1 + rate, periods)) / 
           (Math.pow(1 + rate, periods) - 1);
  }

  /**
   * Calculate standard deviation
   */
  static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate moving average
   */
  static calculateMovingAverage(values: number[], period: number): number[] {
    if (values.length < period) return [];
    
    const result: number[] = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    
    return result;
  }

  /**
   * Calculate weighted average
   */
  static calculateWeightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have the same length');
    }
    
    const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return totalWeight === 0 ? 0 : weightedSum / totalWeight;
  }

  /**
   * Check if number is within range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Clamp number between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Check if number is positive
   */
  static isPositive(value: number): boolean {
    return value > 0;
  }

  /**
   * Check if number is negative
   */
  static isNegative(value: number): boolean {
    return value < 0;
  }

  /**
   * Check if number is zero
   */
  static isZero(value: number): boolean {
    return value === 0;
  }

  /**
   * Check if number is integer
   */
  static isInteger(value: number): boolean {
    return Number.isInteger(value);
  }

  /**
   * Check if number is finite
   */
  static isFinite(value: number): boolean {
    return Number.isFinite(value);
  }

  /**
   * Generate random number between min and max
   */
  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Calculate median of array
   */
  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  /**
   * Calculate mode of array
   */
  static calculateMode(values: number[]): number | null {
    if (values.length === 0) return null;
    
    const frequency: { [key: number]: number } = {};
    let maxFreq = 0;
    let mode: number | null = null;
    
    for (const value of values) {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    }
    
    return mode;
  }

  /**
   * Calculate variance
   */
  static calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Calculate correlation coefficient
   */
  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, value) => sum + value, 0);
    const sumY = y.reduce((sum, value) => sum + value, 0);
    const sumXY = x.reduce((sum, value, index) => sum + value * y[index], 0);
    const sumXX = x.reduce((sum, value) => sum + value * value, 0);
    const sumYY = y.reduce((sum, value) => sum + value * value, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}
