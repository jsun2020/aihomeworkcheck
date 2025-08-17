import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
}

const Upload: React.FC<UploadProps> = ({ user, onLogout, onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
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

    // Simulate AI analysis with mock data
    setTimeout(() => {
      const mockResult = {
        originalImage: previewUrl,
        transcription: "今天的天气很好，我和朋友一起去公园玩。我们看到了许多美丽的花朵和绿色的草地。",
        errors: [
          {
            wrong_char: "天",
            suggested_char: "天",
            confidence: "HIGH",
            error_type: "CORRECT",
            context: "今天的天气"
          },
          {
            wrong_char: "气",
            suggested_char: "气",
            confidence: "HIGH", 
            error_type: "CORRECT",
            context: "天气很好"
          },
          {
            wrong_char: "朋",
            suggested_char: "朋",
            confidence: "MEDIUM",
            error_type: "STROKE",
            context: "我和朋友"
          }
        ],
        totalCharCount: 42
      };

      onAnalysisComplete(mockResult);
      setAnalyzing(false);
      navigate('/results');
    }, 3000);
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