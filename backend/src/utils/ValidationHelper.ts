import { AppError } from '../errors/AppError';

/**
 * Validation utility functions
 */
export class ValidationHelper {
  /**
   * Validate required fields
   */
  static validateRequired(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => {
      const value = this.getNestedValue(data, field);
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw AppError.validation(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate field types
   */
  static validateTypes(data: any, typeMap: { [key: string]: string }): void {
    for (const [field, expectedType] of Object.entries(typeMap)) {
      const value = this.getNestedValue(data, field);
      
      if (value !== undefined && value !== null) {
        const actualType = this.getType(value);
        if (actualType !== expectedType) {
          throw AppError.validation(`Field '${field}' must be of type ${expectedType}, got ${actualType}`);
        }
      }
    }
  }

  /**
   * Validate string length
   */
  static validateStringLength(str: string, minLength: number, maxLength: number, fieldName: string = 'String'): void {
    if (str.length < minLength) {
      throw AppError.validation(`${fieldName} must be at least ${minLength} characters long`);
    }
    if (str.length > maxLength) {
      throw AppError.validation(`${fieldName} must be no more than ${maxLength} characters long`);
    }
  }

  /**
   * Validate number range
   */
  static validateNumberRange(num: number, min: number, max: number, fieldName: string = 'Number'): void {
    if (num < min) {
      throw AppError.validation(`${fieldName} must be at least ${min}`);
    }
    if (num > max) {
      throw AppError.validation(`${fieldName} must be no more than ${max}`);
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw AppError.validation('Invalid email format');
    }
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw AppError.validation('Invalid URL format');
    }
  }

  /**
   * Validate date format
   */
  static validateDate(dateString: string): void {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw AppError.validation('Invalid date format');
    }
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw AppError.validation('Invalid date format');
    }
    
    if (start > end) {
      throw AppError.validation('Start date must be before end date');
    }
  }

  /**
   * Validate array length
   */
  static validateArrayLength(arr: any[], minLength: number, maxLength: number, fieldName: string = 'Array'): void {
    if (arr.length < minLength) {
      throw AppError.validation(`${fieldName} must contain at least ${minLength} items`);
    }
    if (arr.length > maxLength) {
      throw AppError.validation(`${fieldName} must contain no more than ${maxLength} items`);
    }
  }

  /**
   * Validate enum value
   */
  static validateEnum(value: any, allowedValues: any[], fieldName: string = 'Value'): void {
    if (!allowedValues.includes(value)) {
      throw AppError.validation(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
    }
  }

  /**
   * Validate UUID format
   */
  static validateUuid(uuid: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      throw AppError.validation('Invalid UUID format');
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): void {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      throw AppError.validation('Invalid phone number format');
    }
  }

  /**
   * Validate credit card number (Luhn algorithm)
   */
  static validateCreditCard(cardNumber: string): void {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      throw AppError.validation('Invalid credit card number length');
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      throw AppError.validation('Invalid credit card number');
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string, options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}): void {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
    } = options;

    if (password.length < minLength) {
      throw AppError.validation(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw AppError.validation('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw AppError.validation('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/\d/.test(password)) {
      throw AppError.validation('Password must contain at least one number');
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw AppError.validation('Password must contain at least one special character');
    }
  }

  /**
   * Validate JSON string
   */
  static validateJson(jsonString: string): void {
    try {
      JSON.parse(jsonString);
    } catch {
      throw AppError.validation('Invalid JSON format');
    }
  }

  /**
   * Validate file extension
   */
  static validateFileExtension(filename: string, allowedExtensions: string[]): void {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      throw AppError.validation(`File extension must be one of: ${allowedExtensions.join(', ')}`);
    }
  }

  /**
   * Validate file size
   */
  static validateFileSize(size: number, maxSize: number): void {
    if (size > maxSize) {
      throw AppError.validation(`File size must be no more than ${maxSize} bytes`);
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Get type of value
   */
  private static getType(value: any): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str: string): string {
    if (!str) return str;
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Sanitize HTML input
   */
  static sanitizeHtml(html: string): string {
    if (!html) return html;
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }

  /**
   * Validate business rules
   */
  static validateBusinessRules(data: any, rules: { [key: string]: (value: any) => boolean }): void {
    for (const [field, rule] of Object.entries(rules)) {
      const value = this.getNestedValue(data, field);
      if (value !== undefined && !rule(value)) {
        throw AppError.validation(`Business rule validation failed for field: ${field}`);
      }
    }
  }
}
