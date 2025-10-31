/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize MongoDB query to prevent NoSQL injection
 * Removes special MongoDB operators from user input
 */
export function sanitizeMongoQuery(input: any): any {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeMongoQuery);
  }

  const sanitized: any = {};
  for (const key in input) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith('$')) {
      continue;
    }
    sanitized[key] = sanitizeMongoQuery(input[key]);
  }
  return sanitized;
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize string input (basic XSS prevention)
 * Note: React already escapes content, but this adds an extra layer
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 8 characters, contains uppercase, lowercase, and number
 */
export function isStrongPassword(password: string): { 
  valid: boolean; 
  message?: string 
} {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and special characters
  return fileName
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Validate allowed file types
 */
export function isAllowedFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return mimeType.startsWith(prefix);
    }
    return mimeType === type;
  });
}

/**
 * Redact sensitive information from error messages for production
 */
export function sanitizeErrorMessage(error: any): string {
  if (process.env.NODE_ENV === 'production') {
    // Don't expose detailed error messages in production
    if (error.message?.includes('password')) {
      return 'Authentication failed';
    }
    if (error.message?.includes('ECONNREFUSED')) {
      return 'Service temporarily unavailable';
    }
    if (error.message?.includes('MongoDB') || error.message?.includes('database')) {
      return 'Database operation failed';
    }
    return 'An error occurred. Please try again later.';
  }
  
  // In development, return the actual error for debugging
  return error.message || 'An unknown error occurred';
}

/**
 * Rate limit helper - returns true if request should be allowed
 */
export function checkRequestLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  store: Map<string, { count: number; resetTime: number }>
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}
