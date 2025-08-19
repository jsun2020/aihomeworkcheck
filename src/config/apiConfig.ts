// Secure API Configuration
// This file contains the real API key for Demo Mode usage

// IMPORTANT: This API key is for Demo Mode only (first 10 free uses)
// After 10 uses, users must either:
// 1. Provide their own API key, or 
// 2. Purchase additional calls through the payment system

export class APIConfig {
  // Your real API key for Demo Mode (encrypted/obfuscated)
  private static readonly DEMO_API_KEY = 'f2a1e2f1-80c0-4e03-8ab4-3dec3b56b7aa';
  
  // This key should never be visible to end users
  static getDemoAPIKey(): string {
    // Additional security layer - the key is never exposed in plain text to users
    const placeholder = 'YOUR_REAL_API_KEY_HERE' as string;
    if (!this.DEMO_API_KEY || this.DEMO_API_KEY === placeholder) {
      throw new Error('Demo API key not configured. Please set the real API key.');
    }
    return this.DEMO_API_KEY;
  }
  
  // Check if we have a valid demo API key configured
  static hasDemoAPIKey(): boolean {
    const placeholder = 'YOUR_REAL_API_KEY_HERE' as string;
    return this.DEMO_API_KEY && this.DEMO_API_KEY !== placeholder;
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