// 国际化工具
export interface Translations {
  [key: string]: string;
}

export const translations = {
  'en-US': {
    // Header
    'app.title': 'AI Homework Checker',
    'header.welcome': 'Welcome',
    'header.settings': 'Settings',
    'header.logout': 'Logout',
    'header.backToUpload': 'Back to Upload',
    
    // Login
    'login.title': 'Login to AI Homework Checker',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.loginButton': 'Login',
    'login.invalidCredentials': 'Invalid username or password',
    
    // Upload
    'upload.title': 'Upload Homework Image for Analysis',
    'upload.dragDrop': 'Drag and drop an image here, or click to select',
    'upload.chooseFile': 'Choose File',
    'upload.clear': 'Clear',
    'upload.selectedFile': 'Selected file:',
    'upload.size': 'Size:',
    'upload.uploadAnalyze': 'Upload & Analyze',
    'upload.analyzing': 'Analyzing...',
    'upload.analysisProgress': 'AI is analyzing your homework image...',
    'upload.selectImageFirst': 'Please select an image first',
    'upload.analysisFailed': 'Analysis failed. Please try again.',
    'upload.validImageOnly': 'Please select a valid image file',
    
    // Settings
    'settings.title': 'Account Settings',
    'settings.apiConfig': 'API Configuration',
    'settings.apiDescription': 'Configure your own Doubao API key for homework analysis. Get your API key from',
    'settings.apiKey': 'Doubao API Key',
    'settings.test': 'Test',
    'settings.apiKeyHelp': 'Your API key is stored locally and never shared. Without a key, you\'ll use the demo mode.',
    'settings.preferences': 'Preferences',
    'settings.language': 'Language',
    'settings.notifications': 'Enable notifications',
    'settings.saveSettings': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.settingsSaved': 'Settings saved successfully!',
    'settings.invalidApiKey': 'Invalid API key format. Please check your key.',
    'settings.failedToSave': 'Failed to save settings',
    'settings.enterApiKeyFirst': 'Please enter an API key first',
    'settings.testingApiKey': 'Testing API key...',
    'settings.invalidApiKeyTest': '❌ Invalid API key',
    'settings.apiKeyValid': '✅ API key is valid',
    'settings.quotaExceeded': '⚠️ API key valid but quota exceeded',
    'settings.unexpectedResponse': '⚠️ Unexpected response:',
    'settings.networkError': '❌ Network error or invalid API key',
    'settings.apiUsageInfo': 'API Usage Information',
    'settings.model': 'Model:',
    'settings.features': 'Features:',
    'settings.cost': 'Cost:',
    'settings.security': 'Security:',
    'settings.modelValue': 'doubao-seed-1-6-flash-250715',
    'settings.featuresValue': 'Chinese text recognition, error detection',
    'settings.costValue': 'Pay-per-use based on your Volcengine plan',
    'settings.securityValue': 'API key stored locally, not on our servers',
    'settings.charactersCount': 'characters',
    'settings.noKeySet': 'No key set',
    'settings.demoMode': 'Demo Mode',
    'settings.demoModeDescription': 'You are using demo mode with limited usage.',
    'settings.usageRemaining': 'Usage remaining:',
    'settings.times': 'times',
    'settings.upgradeRequired': 'Please add your own API key to continue using the service.',
    
    // Results
    'results.title': 'Analysis Results',
    'results.backToUpload': 'Upload New Image',
    'results.originalImage': 'Original Image',
    'results.transcription': 'Full Transcription',
    'results.errorsFound': 'Errors Found',
    'results.totalCharacters': 'Total Characters:',
    'results.noErrors': 'No errors found! Great job!',
    'results.errorType': 'Error Type:',
    'results.confidence': 'Confidence:',
    'results.context': 'Context:',
    'results.suggestion': 'Suggestion:',
    
    // Language options
    'language.english': 'English',
    'language.chinese': '中文 (Chinese)',
  },
  'zh-CN': {
    // Header
    'app.title': 'AI作业检查器',
    'header.welcome': '欢迎',
    'header.settings': '设置',
    'header.logout': '退出登录',
    'header.backToUpload': '返回上传',
    
    // Login
    'login.title': '登录AI作业检查器',
    'login.username': '用户名',
    'login.password': '密码',
    'login.loginButton': '登录',
    'login.invalidCredentials': '用户名或密码无效',
    
    // Upload
    'upload.title': '上传作业图片进行分析',
    'upload.dragDrop': '拖拽图片到此处，或点击选择',
    'upload.chooseFile': '选择文件',
    'upload.clear': '清除',
    'upload.selectedFile': '已选择文件：',
    'upload.size': '大小：',
    'upload.uploadAnalyze': '上传并分析',
    'upload.analyzing': '分析中...',
    'upload.analysisProgress': 'AI正在分析您的作业图片...',
    'upload.selectImageFirst': '请先选择一张图片',
    'upload.analysisFailed': '分析失败，请重试。',
    'upload.validImageOnly': '请选择有效的图片文件',
    
    // Settings
    'settings.title': '账户设置',
    'settings.apiConfig': 'API配置',
    'settings.apiDescription': '配置您自己的豆包API密钥进行作业分析。从以下地址获取您的API密钥：',
    'settings.apiKey': '豆包API密钥',
    'settings.test': '测试',
    'settings.apiKeyHelp': '您的API密钥存储在本地，不会被共享。没有密钥时，您将使用演示模式。',
    'settings.preferences': '偏好设置',
    'settings.language': '语言',
    'settings.notifications': '启用通知',
    'settings.saveSettings': '保存设置',
    'settings.saving': '保存中...',
    'settings.settingsSaved': '设置保存成功！',
    'settings.invalidApiKey': 'API密钥格式无效，请检查您的密钥。',
    'settings.failedToSave': '保存设置失败',
    'settings.enterApiKeyFirst': '请先输入API密钥',
    'settings.testingApiKey': '正在测试API密钥...',
    'settings.invalidApiKeyTest': '❌ API密钥无效',
    'settings.apiKeyValid': '✅ API密钥有效',
    'settings.quotaExceeded': '⚠️ API密钥有效但配额已用完',
    'settings.unexpectedResponse': '⚠️ 意外响应：',
    'settings.networkError': '❌ 网络错误或API密钥无效',
    'settings.apiUsageInfo': 'API使用信息',
    'settings.model': '模型：',
    'settings.features': '功能：',
    'settings.cost': '费用：',
    'settings.security': '安全：',
    'settings.modelValue': 'doubao-seed-1-6-flash-250715',
    'settings.featuresValue': '中文文本识别，错误检测',
    'settings.costValue': '基于您的火山引擎计划按使用付费',
    'settings.securityValue': 'API密钥存储在本地，不在我们的服务器上',
    'settings.charactersCount': '个字符',
    'settings.noKeySet': '未设置密钥',
    'settings.demoMode': '演示模式',
    'settings.demoModeDescription': '您正在使用有限次数的演示模式。',
    'settings.usageRemaining': '剩余使用次数：',
    'settings.times': '次',
    'settings.upgradeRequired': '请添加您自己的API密钥以继续使用服务。',
    
    // Results
    'results.title': '分析结果',
    'results.backToUpload': '上传新图片',
    'results.originalImage': '原始图片',
    'results.transcription': '完整转录',
    'results.errorsFound': '发现的错误',
    'results.totalCharacters': '总字符数：',
    'results.noErrors': '未发现错误！做得很好！',
    'results.errorType': '错误类型：',
    'results.confidence': '置信度：',
    'results.context': '上下文：',
    'results.suggestion': '建议：',
    
    // Language options
    'language.english': 'English',
    'language.chinese': '中文 (Chinese)',
  }
};

export const t = (key: string, language: 'zh-CN' | 'en-US' = 'en-US'): string => {
  const languageTranslations = translations[language] as Record<string, string>;
  return languageTranslations[key] || key;
};

export const getCurrentLanguage = (userId: string): 'zh-CN' | 'en-US' => {
  const savedSettings = localStorage.getItem(`userSettings_${userId}`);
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    return settings.language || 'en-US';
  }
  return 'en-US';
};