// Doubao API Integration Service
// This service handles communication with the Doubao AI model for Chinese text recognition

import { UsageTracker } from '../utils/usageTracker';
import { APIConfig } from '../config/apiConfig';

interface DoubaoAnalysisRequest {
  imageData: string;
  userLanguage: 'zh-CN' | 'en-US';
  userId?: string;
  customApiKey?: string;
}

interface DoubaoAnalysisResponse {
  total_char_count: number;
  full_transcription: string;
  confidence_score: number;
  response_language: string;
  errors: Array<{
    wrong_char: string;
    suggested_char: string;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    error_type: 'STROKE' | 'RADICAL' | 'PHONETIC' | 'SEMANTIC' | 'CORRECT';
    context: string;
    position: {
      line: number;
      char: number;
    };
  }>;
  quality_issues: string[];
}

export class DoubaoAPIService {
  private static readonly API_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
  private static readonly MODEL = 'doubao-seed-1-6-flash-250715';
  private static readonly REQUEST_TIMEOUT = 45000; // 增加到45秒超时
  private static readonly MAX_IMAGE_SIZE = 512 * 1024; // 512KB最大图片大小
  private static readonly MAX_DIMENSION = 800; // 最大尺寸800px
  private static readonly COMPRESSION_QUALITY = 0.6; // 降低质量到0.6提高速度
  private static readonly MAX_RETRIES = 2; // 最多重试2次

  // 快速检查图片大小
  private static getImageSizeKB(imageData: string): number {
    // Remove data:image/jpeg;base64, prefix and calculate size
    const base64 = imageData.split(',')[1] || imageData;
    return (base64.length * 0.75) / 1024; // Convert to KB
  }

  // 优化图片压缩 - 更快速度
  private static async compressImage(imageData: string): Promise<string> {
    // 如果图片已经很小，跳过压缩
    const currentSize = this.getImageSizeKB(imageData);
    if (currentSize < 200) { // 小于200KB直接返回
      console.log(`Image already small (${currentSize.toFixed(1)}KB), skipping compression`);
      return imageData;
    }
    
    console.log(`Compressing image from ${currentSize.toFixed(1)}KB...`);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 计算压缩后的尺寸，保持宽高比 - 更小的尺寸以提高速度
        let { width, height } = img;
        const maxDimension = DoubaoAPIService.MAX_DIMENSION;
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为JPEG格式，降低质量以提高上传速度
        const compressedData = canvas.toDataURL('image/jpeg', DoubaoAPIService.COMPRESSION_QUALITY);
        const newSize = DoubaoAPIService.getImageSizeKB(compressedData);
        console.log(`Image compressed to ${newSize.toFixed(1)}KB`);
        resolve(compressedData);
      };
      img.src = imageData;
    });
  }

  // 添加超时控制和重试机制的fetch
  private static async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  // 重试功能
  private static async fetchWithRetry(url: string, options: RequestInit, timeout: number, maxRetries: number): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`⚡ API 调用尝试 ${attempt}/${maxRetries + 1}`);
        const response = await this.fetchWithTimeout(url, options, timeout);
        
        if (response.ok) {
          return response;
        }
        
        // 如果是网络错误但不是最后一次尝试，继续重试
        if (attempt < maxRetries + 1 && (response.status >= 500 || response.status === 429)) {
          console.log(`⚠️ 服务器错误 ${response.status}，${2 * attempt}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // 指数退避
          continue;
        }
        
        const errorText = await response.text();
        const apiError = new Error(`API 错误: ${response.status} - ${errorText}`);
        throw apiError;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // 如果不是最后一次尝试且是网络错误，继续重试
        if (attempt < maxRetries + 1 && (lastError.message.includes('timeout') || lastError.message.includes('fetch'))) {
          console.log(`⚠️ 网络错误，${2 * attempt}秒后重试: ${lastError.message}`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // 指数退避
          continue;
        }
        
        // 如果不是网络错误或者是最后一次尝试，直接抛出
        break;
      }
    }
    
    throw lastError!;
  }

  static async analyzeHomework(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    // Priority: Custom API key > User's saved key > Demo API key
    let apiKey = request.customApiKey;
    let isDemoMode = false;
    
    if (!apiKey && request.userId) {
      // Try to get user's saved API key
      const userSettings = localStorage.getItem(`userSettings_${request.userId}`);
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        apiKey = settings.apiKey;
      }
    }
    
    // Check if using demo mode (first 10 free calls)
    if (!apiKey || UsageTracker.isDefaultApiKey(apiKey)) {
      if (request.userId && UsageTracker.isDemoMode(request.userId)) {
        console.log('Using Demo Mode with real API for free trial...');
        isDemoMode = true;
        // Use your real API key for demo mode
        apiKey = APIConfig.getDemoAPIKey();
      } else {
        // After 10 uses, require user API key or payment
        throw new Error('Demo mode limit reached. Please add your own API key or purchase more calls.');
      }
    }
    
    if (!apiKey) {
      throw new Error('No API key available. Please configure your API key in Settings.');
    }

    console.log(isDemoMode ? '⚡ Fast Demo Mode Analysis...' : 'Calling Doubao API with user key...');
    const startTime = Date.now();
    const result = await this.callRealDoubaoAPI({ ...request, customApiKey: apiKey });
    const processingTime = Date.now() - startTime;
    console.log(`✅ Analysis completed in ${(processingTime / 1000).toFixed(1)}s`);
    return result;
  }

  // This method is no longer used - Demo Mode now uses real API with your key
  // Kept for backward compatibility
  private static async callDemoAPI(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    throw new Error('Demo mode now uses real API. This fallback should not be called.');
  }


  private static async callRealDoubaoAPI(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    // 压缩图片以提高上传速度
    console.log('Compressing image...');
    const compressedImageData = await this.compressImage(request.imageData);
    
    // 明确prompt结构以确保正确的JSON格式
    const prompt = `分析这张中文手写作业图片，找出书写错误的字符。请按照以下JSON格式返回结果：

{
  "total_char_count": 总字符数,
  "full_transcription": "完整转录文本",
  "confidence_score": 0.9,
  "response_language": "${request.userLanguage}",
  "errors": [
    {
      "wrong_char": "错误的字",
      "suggested_char": "正确的字", 
      "confidence": "HIGH",
      "error_type": "PHONETIC",
      "context": "包含此字的上下文"
    }
  ],
  "quality_issues": []
}`;

    const payload = {
      model: this.MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: compressedImageData,
                detail: "low" // 低细节模式
              }
            },
            {
              type: "text", 
              text: prompt
            }
          ]
        }
      ],
      temperature: 0, // 最低温度
      max_tokens: 800, // 增加到800以支持更详细的响应
      stream: false,
      top_p: 0.05, // 更低采样值
      frequency_penalty: 0, // 无频率惩罚
      presence_penalty: 0 // 无存在惩罚
    };

    console.log('Sending optimized request to Doubao API...');

    try {
      const response = await this.fetchWithRetry(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.customApiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }, this.REQUEST_TIMEOUT, this.MAX_RETRIES);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Doubao API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Doubao API response:', data);

      // Extract the JSON from the response
      const content = data.choices[0].message.content;
      let analysisResult: DoubaoAnalysisResponse;
      
      try {
        // Try to parse the JSON directly
        analysisResult = JSON.parse(content);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse API response as JSON');
        }
      }

      return analysisResult;
    } catch (error) {
      console.error('⚠️ Doubao API call failed:', error);
      
      // 提供更详细的错误信息
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('timeout')) {
        throw new Error('网络超时，请检查网络连接后重试。建议使用更小的图片或在网络状态良好时重试。');
      } else if (errorMsg.includes('API 错误: 429')) {
        throw new Error('服务繁忙，请稍后再试。如需立即使用，可在设置中添加您自己的API密钥。');
      } else if (errorMsg.includes('API 错误')) {
        throw new Error(`API服务错误：${errorMsg}。请稍后再试或联系技术支持。`);
      } else {
        throw new Error(`分析失败：${errorMsg}。请检查网络连接后重试。`);
      }
    }
  }
}