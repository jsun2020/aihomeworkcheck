import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, getCurrentLanguage } from '../utils/i18n';
import './Results.css';

interface User {
  id: string;
  username: string;
}

interface AnalysisResult {
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
}

interface ResultsProps {
  user: User;
  analysisResult: AnalysisResult;
  onLogout: () => void;
}

const Results: React.FC<ResultsProps> = ({ user, analysisResult, onLogout }) => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<'zh-CN' | 'en-US'>('en-US');


  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage(user.id));
  }, [user.id]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return '#28a745';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getErrorTypeDisplay = (errorType: string) => {
    switch (errorType) {
      case 'STROKE': return 'Stroke Error';
      case 'RADICAL': return 'Radical Error';
      case 'PHONETIC': return 'Phonetic Error';
      case 'SEMANTIC': return 'Semantic Error';
      case 'CORRECT': return 'Correct';
      default: return errorType;
    }
  };

  const handleNewAnalysis = () => {
    navigate('/upload');
  };

  return (
    <div className="results-container">
      <header className="results-header">
        <h1>{t('app.title', currentLanguage)}</h1>
        <div className="user-info">
          <span>{t('header.welcome', currentLanguage)}, {user.username}</span>
          <button onClick={onLogout} className="logout-button">{t('header.logout', currentLanguage)}</button>
        </div>
      </header>

      <main className="results-main">
        <div className="results-layout">
          {/* Left side - Original Image */}
          <div className="original-image-section">
            <h2>{t('results.originalImage', currentLanguage)}</h2>
            <div className="image-container">
              <img 
                src={analysisResult.originalImage} 
                alt="Original homework" 
                className="original-image"
              />
            </div>
          </div>

          {/* Right side - Analysis Results */}
          <div className="analysis-section">
            <h2>{t('results.title', currentLanguage)}</h2>
            
            <div className="stats-summary">
              <div className="stat-item">
                <label>{t('results.totalCharacters', currentLanguage)}</label>
                <span>{analysisResult.totalCharCount}</span>
              </div>
              <div className="stat-item">
                <label>{t('results.errorsFound', currentLanguage)}:</label>
                <span>{analysisResult.errors.filter(error => error.error_type !== 'CORRECT').length}</span>
              </div>
              <div className="stat-item">
                <label>Accuracy:</label>
                <span>
                  {(((analysisResult.totalCharCount - analysisResult.errors.filter(error => error.error_type !== 'CORRECT').length) / analysisResult.totalCharCount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="transcription-section">
              <h3>{t('results.transcription', currentLanguage)}</h3>
              <div className="transcription-text">
                {analysisResult.transcription}
              </div>
            </div>

            <div className="errors-section">
              <h3>Character Analysis</h3>
              <div className="errors-list">
                {analysisResult.errors && analysisResult.errors.length > 0 ? (
                  analysisResult.errors.map((error, index) => (
                    <div key={index} className="error-item">
                      <div className="error-header">
                        <div className="character-comparison">
                          <span className="original-char">{error.wrong_char}</span>
                          {error.error_type !== 'CORRECT' && (
                            <>
                              <span className="arrow">→</span>
                              <span className="suggested-char">{error.suggested_char}</span>
                            </>
                          )}
                        </div>
                        <span 
                          className="confidence-badge"
                          style={{ backgroundColor: getConfidenceColor(error.confidence) }}
                        >
                          {error.confidence}
                        </span>
                      </div>
                      <div className="error-details">
                        <div className="error-type">
                          <strong>Type:</strong> {getErrorTypeDisplay(error.error_type)}
                        </div>
                        <div className="error-context">
                          <strong>Context:</strong> "{error.context}"
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-errors-message">
                    <p>No character errors detected in the analysis. Great job! 🎉</p>
                    <p>This could also indicate that the image analysis needs more processing time or the handwriting is unclear.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button 
                onClick={handleNewAnalysis}
                className="new-analysis-button"
              >
                {t('results.backToUpload', currentLanguage)}
              </button>
              <button 
                onClick={() => window.print()}
                className="print-button"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;