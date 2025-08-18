// 使用次数跟踪工具
export interface UsageInfo {
  count: number;
  maxFreeUsage: number;
  hasCustomKey: boolean;
}

export class UsageTracker {
  private static readonly MAX_FREE_USAGE = 10;
  private static readonly DEFAULT_API_KEY = 'demo_key_***';

  static getUsageInfo(userId: string): UsageInfo {
    const usageKey = `usage_${userId}`;
    const settingsKey = `userSettings_${userId}`;
    
    // 获取使用次数
    const usageData = localStorage.getItem(usageKey);
    const count = usageData ? parseInt(usageData, 10) : 0;
    
    // 检查是否有自定义API密钥
    const settingsData = localStorage.getItem(settingsKey);
    let hasCustomKey = false;
    if (settingsData) {
      const settings = JSON.parse(settingsData);
      hasCustomKey = settings.apiKey && settings.apiKey !== this.DEFAULT_API_KEY && settings.apiKey.trim() !== '';
    }
    
    return {
      count,
      maxFreeUsage: this.MAX_FREE_USAGE,
      hasCustomKey
    };
  }

  static canUseService(userId: string): boolean {
    const usageInfo = this.getUsageInfo(userId);
    return usageInfo.hasCustomKey || usageInfo.count < usageInfo.maxFreeUsage;
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
    return Math.max(0, usageInfo.maxFreeUsage - usageInfo.count);
  }

  static getDefaultApiKey(): string {
    return this.DEFAULT_API_KEY;
  }

  static isDefaultApiKey(apiKey: string): boolean {
    return apiKey === this.DEFAULT_API_KEY || !apiKey || apiKey.trim() === '';
  }
}