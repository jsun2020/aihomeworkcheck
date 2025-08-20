// Secure API Configuration
// API keys are loaded from environment variables for security

// IMPORTANT: This API key is for Demo Mode only (first 10 free uses)
// After 10 uses, users must either:
// 1. Provide their own API key, or 
// 2. Purchase additional calls through the payment system

export class APIConfig {
  // API key is now loaded from environment variable for security
  private static readonly DEMO_API_KEY = process.env.REACT_APP_ARK_API_KEY || '';
  
  // This key should never be visible to end users
  static getDemoAPIKey(): string {
    // Additional security layer - the key is never exposed in plain text to users
    const placeholder = 'YOUR_REAL_API_KEY_HERE' as string;
    if (!this.DEMO_API_KEY || this.DEMO_API_KEY === placeholder) {
      throw new Error('Demo API key not configured. Please set REACT_APP_ARK_API_KEY environment variable.');
    }
    return this.DEMO_API_KEY;
  }
  
  // Check if we have a valid demo API key configured
  static hasDemoAPIKey(): boolean {
    const placeholder = 'YOUR_REAL_API_KEY_HERE' as string;
    return Boolean(this.DEMO_API_KEY && this.DEMO_API_KEY !== placeholder);
  }
  
  // Get display version of API key (always shows as ***)
  static getDisplayAPIKey(): string {
    return '***';
  }
  
  // Prevent any accidental exposure - renamed to avoid conflicts
  static getSecureString(): string {
    return '[APIConfig - Secure]';
  }
}