// Doubao API Integration Service
// This service handles communication with the Doubao AI model for Chinese text recognition

import { UsageTracker } from '../utils/usageTracker';

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
  private static readonly REQUEST_TIMEOUT = 60000; // 60秒超时
  private static readonly MAX_IMAGE_SIZE = 1024 * 1024; // 1MB最大图片大小

  // 压缩图片以提高上传速度
  private static async compressImage(imageData: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // 计算压缩后的尺寸，保持宽高比
        let { width, height } = img;
        const maxDimension = 1200; // 最大尺寸
        
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
        
        // 转换为JPEG格式，质量0.8
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedData);
      };
      img.src = imageData;
    });
  }

  // 添加超时控制的fetch
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

  static async analyzeHomework(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    // Priority: Custom API key > User's saved key > Environment key
    let apiKey = request.customApiKey;
    
    if (!apiKey && request.userId) {
      // Try to get user's saved API key
      const userSettings = localStorage.getItem(`userSettings_${request.userId}`);
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        apiKey = settings.apiKey;
      }
    }
    
    // Check if using demo mode
    if (!apiKey || UsageTracker.isDefaultApiKey(apiKey)) {
      console.log('Using demo mode...');
      return await this.callDemoAPI(request);
    }
    
    if (!apiKey) {
      // Fallback to environment key
      apiKey = process.env.REACT_APP_ARK_API_KEY;
    }
    
    if (!apiKey || apiKey === 'your_ark_api_key_here') {
      throw new Error('No API key configured. Please set your API key in Settings or contact administrator.');
    }

    console.log('Calling real Doubao API with image data...');
    return await this.callRealDoubaoAPI({ ...request, customApiKey: apiKey });
  }

  private static async callDemoAPI(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 返回模拟的分析结果
    return {
      total_char_count: 45,
      full_transcription: "这是一个演示模式的分析结果。在演示模式下，我们提供模拟的错别字检测功能。请添加您自己的API密钥以获得真实的分析结果。",
      confidence_score: 0.85,
      response_language: request.userLanguage,
      errors: [
        {
          wrong_char: "演",
          suggested_char: "演",
          confidence: "HIGH" as const,
          error_type: "CORRECT" as const,
          context: "演示模式",
          position: { line: 1, char: 5 }
        },
        {
          wrong_char: "示",
          suggested_char: "示",
          confidence: "HIGH" as const,
          error_type: "CORRECT" as const,
          context: "演示模式",
          position: { line: 1, char: 6 }
        }
      ],
      quality_issues: ["演示模式 - 请添加真实API密钥获得准确结果"]
    };
  }


  private static async callRealDoubaoAPI(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    // 压缩图片以提高上传速度
    console.log('Compressing image...');
    const compressedImageData = await this.compressImage(request.imageData);
    
    // 优化后的简洁prompt
    const prompt = `分析图片中的中文文字，找出错别字。返回JSON格式：
{
  "total_char_count": <数字>,
  "full_transcription": "<文本>",
  "confidence_score": <0-1>,
  "response_language": "${request.userLanguage}",
  "errors": [
    {
      "wrong_char": "<错字>",
      "suggested_char": "<正字>", 
      "confidence": "<HIGH|MEDIUM|LOW>",
      "error_type": "<STROKE|RADICAL|PHONETIC|SEMANTIC|CORRECT>",
      "context": "<上下文>",
      "position": {"line": <行>, "char": <位置>}
    }
  ],
  "quality_issues": ["<问题>"]
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
                detail: "low" // 使用低细节模式加快处理速度
              }
            },
            {
              type: "text", 
              text: prompt
            }
          ]
        }
      ],
      temperature: 0.1, // 降低温度提高确定性和速度
      max_tokens: 1000, // 减少token数量
      stream: false // 确保不使用流式响应
    };

    console.log('Sending optimized request to Doubao API...');

    try {
      const response = await this.fetchWithTimeout(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${request.customApiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }, this.REQUEST_TIMEOUT);

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
      console.error('Doubao API call failed:', error);
      throw error;
    }
  }
}