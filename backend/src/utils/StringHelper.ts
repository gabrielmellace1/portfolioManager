/**
 * String utility functions
 */
export class StringHelper {
  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Capitalize first letter of each word
   */
  static capitalizeWords(str: string): string {
    if (!str) return str;
    return str.split(' ').map(word => this.capitalize(word)).join(' ');
  }

  /**
   * Convert string to camelCase
   */
  static toCamelCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert string to kebab-case
   */
  static toKebabCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert string to snake_case
   */
  static toSnakeCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Convert string to PascalCase
   */
  static toPascalCase(str: string): string {
    if (!str) return str;
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
      .replace(/\s+/g, '');
  }

  /**
   * Truncate string to specified length
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (!str || str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Remove extra whitespace
   */
  static normalizeWhitespace(str: string): string {
    if (!str) return str;
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Remove all whitespace
   */
  static removeWhitespace(str: string): string {
    if (!str) return str;
    return str.replace(/\s+/g, '');
  }

  /**
   * Check if string is empty or only whitespace
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string is not empty
   */
  static isNotEmpty(str: string): boolean {
    return !this.isEmpty(str);
  }

  /**
   * Check if string contains only letters
   */
  static isAlpha(str: string): boolean {
    if (!str) return false;
    return /^[a-zA-Z]+$/.test(str);
  }

  /**
   * Check if string contains only numbers
   */
  static isNumeric(str: string): boolean {
    if (!str) return false;
    return /^\d+$/.test(str);
  }

  /**
   * Check if string contains only alphanumeric characters
   */
  static isAlphaNumeric(str: string): boolean {
    if (!str) return false;
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Check if string is a valid email
   */
  static isValidEmail(str: string): boolean {
    if (!str) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * Check if string is a valid URL
   */
  static isValidUrl(str: string): boolean {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate random string
   */
  static random(length: number = 10, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate slug from string
   */
  static slugify(str: string): string {
    if (!str) return str;
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Mask sensitive string (e.g., credit card, email)
   */
  static mask(str: string, visibleChars: number = 4, maskChar: string = '*'): string {
    if (!str || str.length <= visibleChars) return str;
    
    const visible = str.slice(-visibleChars);
    const masked = maskChar.repeat(str.length - visibleChars);
    
    return masked + visible;
  }

  /**
   * Extract numbers from string
   */
  static extractNumbers(str: string): number[] {
    if (!str) return [];
    const matches = str.match(/\d+\.?\d*/g);
    return matches ? matches.map(Number) : [];
  }

  /**
   * Extract letters from string
   */
  static extractLetters(str: string): string {
    if (!str) return '';
    return str.replace(/[^a-zA-Z]/g, '');
  }

  /**
   * Count words in string
   */
  static countWords(str: string): number {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count characters in string
   */
  static countCharacters(str: string): number {
    return str ? str.length : 0;
  }

  /**
   * Reverse string
   */
  static reverse(str: string): string {
    if (!str) return str;
    return str.split('').reverse().join('');
  }

  /**
   * Check if string is palindrome
   */
  static isPalindrome(str: string): boolean {
    if (!str) return false;
    const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized === this.reverse(normalized);
  }

  /**
   * Remove duplicates from string
   */
  static removeDuplicates(str: string): string {
    if (!str) return str;
    return [...new Set(str.split(''))].join('');
  }

  /**
   * Pad string to specified length
   */
  static pad(str: string, length: number, padString: string = ' '): string {
    if (!str || str.length >= length) return str;
    return str.padStart(length, padString);
  }

  /**
   * Pad string to specified length (right side)
   */
  static padEnd(str: string, length: number, padString: string = ' '): string {
    if (!str || str.length >= length) return str;
    return str.padEnd(length, padString);
  }

  /**
   * Check if string starts with specified substring
   */
  static startsWith(str: string, prefix: string): boolean {
    if (!str || !prefix) return false;
    return str.startsWith(prefix);
  }

  /**
   * Check if string ends with specified substring
   */
  static endsWith(str: string, suffix: string): boolean {
    if (!str || !suffix) return false;
    return str.endsWith(suffix);
  }

  /**
   * Replace all occurrences of substring
   */
  static replaceAll(str: string, search: string, replacement: string): string {
    if (!str) return str;
    return str.split(search).join(replacement);
  }

  /**
   * Split string by delimiter and trim each part
   */
  static splitAndTrim(str: string, delimiter: string = ','): string[] {
    if (!str) return [];
    return str.split(delimiter).map(part => part.trim()).filter(part => part.length > 0);
  }

  /**
   * Join array of strings with delimiter
   */
  static join(array: string[], delimiter: string = ', '): string {
    if (!array || array.length === 0) return '';
    return array.filter(item => item && item.trim().length > 0).join(delimiter);
  }
}
