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
  const navigate = useNavigate();

  useEffect(() => {
    // 获取用户的语言设置
    setCurrentLanguage(getCurrentLanguage(user.id));
  }, [user.id]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      // Clear any previous analysis results
      onNewAnalysisStarted();
      
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
      alert(t('settings.upgradeRequired', currentLanguage));
      navigate('/settings');
      return;
    }

    setAnalyzing(true);
    setAnalysisStep(t('upload.preparingImage', currentLanguage));

    try {
      // Get user's language preference from localStorage
      const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
      const userLanguage = savedSettings ? JSON.parse(savedSettings).language || 'en-US' : 'en-US';
      
      setAnalysisStep(t('upload.sendingToAI', currentLanguage));
      
      // Call Doubao API service
      const analysisResult = await DoubaoAPIService.analyzeHomework({
        imageData: previewUrl,
        userLanguage: userLanguage,
        userId: user.id
      });

      setAnalysisStep(t('upload.processingResults', currentLanguage));

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
      setAnalyzing(false);
      setAnalysisStep('');
      navigate('/results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalyzing(false);
      setAnalysisStep('');
      
      // 更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : t('upload.analysisFailed', currentLanguage);
      if (errorMessage.includes('timeout')) {
        alert(t('upload.timeoutError', currentLanguage));
      } else {
        alert(errorMessage);
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
              ({t('settings.usageRemaining', currentLanguage)}: {remainingUsage})
            </span>
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