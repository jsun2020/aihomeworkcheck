// 使用次数跟踪工具
export interface UsageInfo {
  count: number;
  maxFreeUsage: number;
  hasCustomKey: boolean;
  purchasedCalls: number;
  totalAvailableCalls: number;
}

export class UsageTracker {
  private static readonly MAX_FREE_USAGE = 10;
  private static readonly DEFAULT_API_KEY = 'demo_key_***';
  private static readonly DEMO_DISPLAY_KEY = '***';

  static getUsageInfo(userId: string): UsageInfo {
    const usageKey = `usage_${userId}`;
    const settingsKey = `userSettings_${userId}`;
    const purchasedKey = `purchased_calls_${userId}`;
    
    // 获取使用次数
    const usageData = localStorage.getItem(usageKey);
    const count = usageData ? parseInt(usageData, 10) : 0;
    
    // 获取购买的调用次数
    const purchasedData = localStorage.getItem(purchasedKey);
    const purchasedCalls = purchasedData ? parseInt(purchasedData, 10) : 0;
    
    // 检查是否有自定义API密钥
    const settingsData = localStorage.getItem(settingsKey);
    let hasCustomKey = false;
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      hasCustomKey = settings.apiKey && settings.apiKey !== this.DEFAULT_API_KEY && settings.apiKey.trim() !== '';
    }
    
    const totalAvailableCalls = this.MAX_FREE_USAGE + purchasedCalls;
    
    return {
      count,
      maxFreeUsage: this.MAX_FREE_USAGE,
      hasCustomKey,
      purchasedCalls,
      totalAvailableCalls
    };
  }

  static canUseService(userId: string): boolean {
    const usageInfo = this.getUsageInfo(userId);
    return usageInfo.hasCustomKey || usageInfo.count < usageInfo.totalAvailableCalls;
  }

  static incrementUsage(userId: string): void {
    const usageKey = `usage_${userId}`;
    const currentCount = this.getUsageInfo(userId).count;
    localStorage.setItem(usageKey, (currentCount + 1).toString());
  }

  static getRemainingUsage(userId: string): number {
    const usageInfo = this.getUsageInfo(userId);
    if (usageInfo.hasCustomKey) {
      return -1; // 无限制
    }
    return Math.max(0, usageInfo.totalAvailableCalls - usageInfo.count);
  }

  static getDefaultApiKey(): string {
    return this.DEFAULT_API_KEY;
  }

  static getDemoDisplayKey(): string {
    return this.DEMO_DISPLAY_KEY;
  }

  static isDefaultApiKey(apiKey: string): boolean {
    return apiKey === this.DEFAULT_API_KEY || !apiKey || apiKey.trim() === '';
  }

  static isDemoMode(userId: string): boolean {
    const usageInfo = this.getUsageInfo(userId);
    return !usageInfo.hasCustomKey && usageInfo.count < this.MAX_FREE_USAGE;
  }

  static addCalls(userId: string, calls: number): void {
    const purchasedKey = `purchased_calls_${userId}`;
    const currentPurchased = this.getUsageInfo(userId).purchasedCalls;
    localStorage.setItem(purchasedKey, (currentPurchased + calls).toString());
  }

  static getPurchasedCalls(userId: string): number {
    const usageInfo = this.getUsageInfo(userId);
    return usageInfo.purchasedCalls;
  }

  static needsPayment(userId: string): boolean {
    const usageInfo = this.getUsageInfo(userId);
    return !usageInfo.hasCustomKey && usageInfo.count >= usageInfo.totalAvailableCalls;
  }
}