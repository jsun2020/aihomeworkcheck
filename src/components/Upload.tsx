import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoubaoAPIService } from '../services/doubaoAPI';
import { t, getCurrentLanguage } from '../utils/i18n';
import { UsageTracker } from '../utils/usageTracker';
import './Upload.css';

interface User {
  id: string;
  username: string;
}

interface UploadProps {
  user: User;
  onLogout: () => void;
  onAnalysisComplete: (result: {
    originalImage: string;
    transcription: string;
    errors: Array<{
      wrong_char: string;
      suggested_char: string;
      confidence: string;
      error_type: string;
      context: string;
    }>;
    totalCharCount: number;
  }) => void;
  onNewAnalysisStarted: () => void;
}

const Upload: React.FC<UploadProps> = ({ user, onLogout, onAnalysisComplete, onNewAnalysisStarted }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'zh-CN' | 'en-US'>('en-US');
  const [startTime, setStartTime] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 获取用户的语言设置
    setCurrentLanguage(getCurrentLanguage(user.id));
  }, [user.id]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Clear any previous analysis results
      onNewAnalysisStarted();
      
      // Check file size and warn if too large
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 5) {
        // eslint-disable-next-line no-restricted-globals
        const shouldContinue = confirm(`⚠️ 图片较大 (${fileSizeMB.toFixed(1)}MB)\n可能影响分析速度和成功率。\n\n💡 建议：\n- 使用小于2MB的图片\n- 确保网络连接稳定\n\n是否继续上传？`);
        if (!shouldContinue) {
          return;
        }
      } else if (fileSizeMB > 2) {
        console.log(`⚡ 图片大小: ${fileSizeMB.toFixed(1)}MB - 将自动优化以提高速度`);
      } else {
        console.log(`✅ 图片大小适中: ${fileSizeMB.toFixed(1)}MB - 预计快速分析`);
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert(t('upload.validImageOnly', currentLanguage));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert(t('upload.selectImageFirst', currentLanguage));
      return;
    }

    // 检查使用次数限制
    if (!UsageTracker.canUseService(user.id)) {
      const usageInfo = UsageTracker.getUsageInfo(user.id);
      if (usageInfo.hasCustomKey) {
        alert(t('settings.upgradeRequired', currentLanguage));
        navigate('/settings');
      } else {
        alert(t('payment.upgradeRequired', currentLanguage));
        navigate('/payment');
      }
      return;
    }

    setAnalyzing(true);
    setStartTime(Date.now());
    setAnalysisStep(t('upload.fastProcessing', currentLanguage));
    
    try {
      // Get user's language preference from localStorage
      const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
      const userLanguage = savedSettings ? JSON.parse(savedSettings).language || 'en-US' : 'en-US';
      
      // Show compression step with time update
      setAnalysisStep('🗜️ 优化图片中...');
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay to show step
      
      setAnalysisStep('🚀 AI极速分析中...');
      
      // Call Doubao API service
      const analysisResult = await DoubaoAPIService.analyzeHomework({
        imageData: previewUrl,
        userLanguage: userLanguage,
        userId: user.id
      });

      setAnalysisStep('⚙️ 处理结果中...');

      // 增加使用次数（只有在使用演示模式时才计数）
      const usageInfo = UsageTracker.getUsageInfo(user.id);
      if (!usageInfo.hasCustomKey) {
        UsageTracker.incrementUsage(user.id);
      }
      
      const result = {
        originalImage: previewUrl,
        transcription: analysisResult.full_transcription,
        errors: analysisResult.errors.map(error => ({
          wrong_char: error.wrong_char,
          suggested_char: error.suggested_char,
          confidence: error.confidence,
          error_type: error.error_type,
          context: error.context
        })),
        totalCharCount: analysisResult.total_char_count
      };

      onAnalysisComplete(result);
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Total analysis time: ${totalTime}s`);
      setAnalyzing(false);
      setAnalysisStep('');
      navigate('/results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalyzing(false);
      setAnalysisStep('');
      
      // 更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : t('upload.analysisFailed', currentLanguage);
      
      if (errorMessage.includes('Demo mode limit reached')) {
        alert(`${t('settings.demoMode', currentLanguage)} ${t('settings.upgradeRequired', currentLanguage)}`);
        navigate('/payment');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
        alert(`⚠️ 网络超时\n请检查网络连接后重试。\n如问题持续，请稍后再试或检查图片大小。`);
      } else if (errorMessage.includes('API 错误: 429')) {
        alert(`⚠️ 服务繁忙\n请稍后再试，或在设置中使用您自己的API密钥。`);
      } else if (errorMessage.includes('API 错误: 5')) {
        alert(`⚠️ 服务器错误\n请稍后再试。如问题持续，请联系技术支持。`);
      } else if (errorMessage.includes('fetch')) {
        alert(`⚠️ 网络连接错误\n请检查您的网络连接并重试。`);
      } else {
        alert(`⚠️ 分析失败\n${errorMessage}\n请稍后重试或联系技术支持。`);
      }
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const remainingUsage = UsageTracker.getRemainingUsage(user.id);
  const usageInfo = UsageTracker.getUsageInfo(user.id);

  return (
    <div className="upload-container">
      <header className="upload-header">
        <h1>{t('app.title', currentLanguage)}</h1>
        <div className="user-info">
          <span>{t('header.welcome', currentLanguage)}, {user.username}</span>
          {!usageInfo.hasCustomKey && (
            <span className="usage-info">
              ({t('settings.demoMode', currentLanguage)}: {remainingUsage}/{usageInfo.maxFreeUsage} {t('settings.times', currentLanguage)})
            </span>
          )}
          {!usageInfo.hasCustomKey && remainingUsage <= 5 && (
            <button onClick={() => navigate('/payment')} className="payment-button">💳 {t('payment.title', currentLanguage)}</button>
          )}
          <button onClick={() => navigate('/settings')} className="settings-button">⚙️ {t('header.settings', currentLanguage)}</button>
          <button onClick={onLogout} className="logout-button">{t('header.logout', currentLanguage)}</button>
        </div>
      </header>

      <main className="upload-main">
        <h2>{t('upload.title', currentLanguage)}</h2>
        
        <div 
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!previewUrl ? (
            <div className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <p>{t('upload.dragDrop', currentLanguage)}</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                {t('upload.chooseFile', currentLanguage)}
              </label>
            </div>
          ) : (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
              <button onClick={clearSelection} className="clear-button">
                ✕ {t('upload.clear', currentLanguage)}
              </button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="file-info">
            <p><strong>{t('upload.selectedFile', currentLanguage)}</strong> {selectedFile.name}</p>
            <p><strong>{t('upload.size', currentLanguage)}</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            onClick={handleAnalyze}
            className="analyze-button"
            disabled={!selectedFile || analyzing || (!usageInfo.hasCustomKey && remainingUsage === 0)}
          >
            {analyzing ? (
              <span>
                <span className="spinner"></span>
                {t('upload.analyzing', currentLanguage)}
              </span>
            ) : (
              t('upload.uploadAnalyze', currentLanguage)
            )}
          </button>
        </div>

        {analyzing && (
          <div className="analysis-progress">
            <p>{analysisStep || t('upload.analysisProgress', currentLanguage)}</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <small className="progress-tip">
              {t('upload.optimizedProcessing', currentLanguage)}
            </small>
          </div>
        )}
      </main>
    </div>
  );
};

export default Upload;