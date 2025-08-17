// Doubao API Integration Service
// This service handles communication with the Doubao AI model for Chinese text recognition

interface DoubaoAnalysisRequest {
  imageData: string;
  userLanguage: 'zh-CN' | 'en-US';
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

  static async analyzeHomework(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    const apiKey = process.env.REACT_APP_ARK_API_KEY;
    
    if (!apiKey || apiKey === 'your_ark_api_key_here') {
      throw new Error('ARK_API_KEY not configured. Please set your API key in the .env file.');
    }

    console.log('Calling real Doubao API with image data...');
    return await this.callRealDoubaoAPI(request);
  }


  private static async callRealDoubaoAPI(request: DoubaoAnalysisRequest): Promise<DoubaoAnalysisResponse> {
    const prompt = `你是一位精通中文语言文字的校对专家，尤其擅长识别和修正由OCR（光学字符识别）技术产生的文本错误。你对中文的同音字、形近字以及词语的语境应用有深刻的理解。

请分析这张小学生作业图片，识别其中的错别字。请返回一个JSON格式的结果，结构如下：
{
  "total_char_count": <字符总数>,
  "full_transcription": "<完整的文本转录>",
  "confidence_score": <0-1之间的置信度>,
  "response_language": "${request.userLanguage}",
  "errors": [
    {
      "wrong_char": "<错误的字符>",
      "suggested_char": "<正确的字符>", 
      "confidence": "<HIGH|MEDIUM|LOW>",
      "error_type": "<STROKE|RADICAL|PHONETIC|SEMANTIC>",
      "context": "<上下文>",
      "position": {"line": <行号>, "char": <字符位置>}
    }
  ],
  "quality_issues": ["<图片质量问题>"]
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
                url: request.imageData
              }
            },
            {
              type: "text", 
              text: prompt
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    };

    console.log('Sending request to Doubao API:', this.API_ENDPOINT);

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_ARK_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

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