import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Upload from './components/Upload';
import Results from './components/Results';
import Settings from './components/Settings';
import Payment from './components/Payment';

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleNewAnalysisStarted = () => {
    setAnalysisResult(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/upload" replace /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/upload" 
            element={
              user ? 
              <Upload 
                user={user} 
                onLogout={handleLogout}
                onAnalysisComplete={handleAnalysisComplete}
                onNewAnalysisStarted={handleNewAnalysisStarted}
              /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/results" 
            element={
              user && analysisResult ? 
              <Results 
                user={user}
                analysisResult={analysisResult}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/settings" 
            element={
              user ? 
              <Settings 
                user={user}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/payment" 
            element={
              user ? 
              <Payment 
                user={user}
                onLogout={handleLogout}
                onPaymentSuccess={() => {}}
              /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;