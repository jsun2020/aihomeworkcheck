import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoubaoAPIService } from '../services/doubaoAPI';
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
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

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
      alert('Please select a valid image file');
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
      alert('Please select an image first');
      return;
    }

    setAnalyzing(true);

    try {
      // Call Doubao API service
      const analysisResult = await DoubaoAPIService.analyzeHomework({
        imageData: previewUrl,
        userLanguage: 'zh-CN'
      });
      
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
      navigate('/results');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalyzing(false);
      alert('Analysis failed. Please try again.');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  return (
    <div className="upload-container">
      <header className="upload-header">
        <h1>AI Homework Checker</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="upload-main">
        <h2>Upload Homework Image for Analysis</h2>
        
        <div 
          className={`upload-area ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!previewUrl ? (
            <div className="upload-placeholder">
              <div className="upload-icon">📁</div>
              <p>Drag and drop an image here, or click to select</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                Choose File
              </label>
            </div>
          ) : (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
              <button onClick={clearSelection} className="clear-button">
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="file-info">
            <p><strong>Selected file:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="action-buttons">
          <button 
            onClick={handleAnalyze}
            className="analyze-button"
            disabled={!selectedFile || analyzing}
          >
            {analyzing ? (
              <span>
                <span className="spinner"></span>
                Analyzing...
              </span>
            ) : (
              'Upload & Analyze'
            )}
          </button>
        </div>

        {analyzing && (
          <div className="analysis-progress">
            <p>AI is analyzing your homework image...</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Upload;