import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

interface User {
  id: string;
  username: string;
}

interface SettingsProps {
  user: User;
  onLogout: () => void;
}

interface UserSettings {
  apiKey: string;
  notifications: boolean;
  language: 'zh-CN' | 'en-US';
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    apiKey: '',
    notifications: true,
    language: 'zh-CN'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load user settings from localStorage
    const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [user.id]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Validate API key format (basic validation)
      if (settings.apiKey && !isValidApiKey(settings.apiKey)) {
        throw new Error('Invalid API key format. Please check your key.');
      }

      // Save to localStorage (in production, this would be saved to your backend)
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings));
      
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isValidApiKey = (key: string): boolean => {
    // Basic validation for ARK API key format
    return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(key);
  };

  const handleApiKeyChange = (value: string) => {
    setSettings(prev => ({ ...prev, apiKey: value }));
  };

  const testApiKey = async () => {
    if (!settings.apiKey) {
      setMessage('Please enter an API key first');
      return;
    }

    setSaving(true);
    setMessage('Testing API key...');

    try {
      // Simple test call to verify API key
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-6-flash-250715',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      });

      if (response.status === 401) {
        setMessage('❌ Invalid API key');
      } else if (response.status === 429) {
        setMessage('⚠️ API key valid but quota exceeded');
      } else if (response.ok || response.status === 400) {
        setMessage('✅ API key is valid');
      } else {
        setMessage(`⚠️ Unexpected response: ${response.status}`);
      }
    } catch (error) {
      setMessage('❌ Network error or invalid API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>Account Settings</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/upload')} className="back-button">
            ← Back to Upload
          </button>
          <div className="user-info">
            <span>Welcome, {user.username}</span>
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-section">
          <h2>🔑 API Configuration</h2>
          <p className="section-description">
            Configure your own Doubao API key for homework analysis. Get your API key from 
            <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer"> Volcengine ARK Console</a>.
          </p>

          <div className="form-group">
            <label htmlFor="apiKey">Doubao API Key</label>
            <div className="api-key-input">
              <input
                type={showApiKey ? 'text' : 'password'}
                id="apiKey"
                value={settings.apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="f2a1e2f1-80c0-4e03-8ab4-3dec3b56b7aa"
                className="api-key-field"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="toggle-visibility"
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
              <button
                type="button"
                onClick={testApiKey}
                disabled={!settings.apiKey || saving}
                className="test-button"
              >
                Test
              </button>
            </div>
            <small className="help-text">
              Your API key is stored locally and never shared. Without a key, you'll use the demo mode.
            </small>
          </div>
        </div>

        <div className="settings-section">
          <h2>⚙️ Preferences</h2>
          
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'zh-CN' | 'en-US' }))}
              className="language-select"
            >
              <option value="zh-CN">中文 (Chinese)</option>
              <option value="en-US">English</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
              />
              <span>Enable notifications</span>
            </label>
          </div>
        </div>

        <div className="actions">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
            {message}
          </div>
        )}

        <div className="info-section">
          <h3>📋 API Usage Information</h3>
          <ul>
            <li><strong>Model:</strong> doubao-seed-1-6-flash-250715</li>
            <li><strong>Features:</strong> Chinese text recognition, error detection</li>
            <li><strong>Cost:</strong> Pay-per-use based on your Volcengine plan</li>
            <li><strong>Security:</strong> API key stored locally, not on our servers</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Settings;