import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '../utils/i18n';
import { UsageTracker } from '../utils/usageTracker';
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
    apiKey: UsageTracker.getDefaultApiKey(),
    notifications: true,
    language: 'en-US'
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<'zh-CN' | 'en-US'>('en-US');

  useEffect(() => {
    // Load user settings from localStorage
    const savedSettings = localStorage.getItem(`userSettings_${user.id}`);
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      // 如果没有API密钥，使用默认的演示密钥
      if (!loadedSettings.apiKey || loadedSettings.apiKey.trim() === '') {
        loadedSettings.apiKey = UsageTracker.getDefaultApiKey();
      }
      setSettings(loadedSettings);
      setCurrentLanguage(loadedSettings.language || 'en-US');
    } else {
      // 初始化默认设置
      const defaultSettings = {
        apiKey: UsageTracker.getDefaultApiKey(),
        notifications: true,
        language: 'en-US' as 'zh-CN' | 'en-US'
      };
      setSettings(defaultSettings);
      setCurrentLanguage('en-US');
    }
  }, [user.id]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Validate API key format (basic validation) - skip validation for default demo key
      if (settings.apiKey && !UsageTracker.isDefaultApiKey(settings.apiKey) && !isValidApiKey(settings.apiKey)) {
        throw new Error(t('settings.invalidApiKey', currentLanguage));
      }

      // Save to localStorage (in production, this would be saved to your backend)
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings));
      
      // Update current language
      setCurrentLanguage(settings.language);
      
      setMessage(t('settings.settingsSaved', settings.language));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('settings.failedToSave', currentLanguage));
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
      setMessage(t('settings.enterApiKeyFirst', currentLanguage));
      return;
    }

    if (UsageTracker.isDefaultApiKey(settings.apiKey)) {
      const usageInfo = UsageTracker.getUsageInfo(user.id);
      setMessage(`${t('settings.demoMode', currentLanguage)} - ${t('settings.usageRemaining', currentLanguage)} ${UsageTracker.getRemainingUsage(user.id)} ${t('settings.times', currentLanguage)}`);
      return;
    }

    setSaving(true);
    setMessage(t('settings.testingApiKey', currentLanguage));

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
        setMessage(t('settings.invalidApiKeyTest', currentLanguage));
      } else if (response.status === 429) {
        setMessage(t('settings.quotaExceeded', currentLanguage));
      } else if (response.ok || response.status === 400) {
        setMessage(t('settings.apiKeyValid', currentLanguage));
      } else {
        setMessage(`${t('settings.unexpectedResponse', currentLanguage)} ${response.status}`);
      }
    } catch (error) {
      setMessage(t('settings.networkError', currentLanguage));
    } finally {
      setSaving(false);
    }
  };

  const remainingUsage = UsageTracker.getRemainingUsage(user.id);

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>{t('settings.title', currentLanguage)}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/upload')} className="back-button">
            ← {t('header.backToUpload', currentLanguage)}
          </button>
          <div className="user-info">
            <span>{t('header.welcome', currentLanguage)}, {user.username}</span>
            <button onClick={onLogout} className="logout-button">{t('header.logout', currentLanguage)}</button>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-section">
          <h2>🔑 {t('settings.apiConfig', currentLanguage)}</h2>
          <p className="section-description">
            {t('settings.apiDescription', currentLanguage)} 
            <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer"> Volcengine ARK Console</a>.
          </p>

          {!UsageTracker.getUsageInfo(user.id).hasCustomKey && (
            <div className="demo-mode-info">
              <h3>🎯 {t('settings.demoMode', currentLanguage)}</h3>
              <p>{t('settings.demoModeDescription', currentLanguage)}</p>
              <p><strong>{t('settings.usageRemaining', currentLanguage)} {remainingUsage} {t('settings.times', currentLanguage)}</strong></p>
              {remainingUsage === 0 && (
                <p className="upgrade-notice">{t('settings.upgradeRequired', currentLanguage)}</p>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="apiKey">{t('settings.apiKey', currentLanguage)}</label>
            <div className="api-key-input">
              {showApiKey ? (
                <div 
                  className="api-key-display"
                  onCopy={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <span className="masked-key">
                    {UsageTracker.isDefaultApiKey(settings.apiKey) ? '***' : '•'.repeat(settings.apiKey.length)}
                  </span>
                  <span className="key-info">
                    {UsageTracker.isDefaultApiKey(settings.apiKey) 
                      ? t('settings.demoMode', currentLanguage)
                      : settings.apiKey 
                        ? `(${settings.apiKey.length} ${t('settings.charactersCount', currentLanguage)})` 
                        : t('settings.noKeySet', currentLanguage)
                    }
                  </span>
                </div>
              ) : (
                <input
                  type="password"
                  id="apiKey"
                  value={settings.apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="f2a1e2f1-80c0-4e03-8ab4-3dec3b56b7aa"
                  className="api-key-field"
                />
              )}
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="toggle-visibility"
              >
                {showApiKey ? '🔒' : '👁️'}
              </button>
              <button
                type="button"
                onClick={testApiKey}
                disabled={!settings.apiKey || saving}
                className="test-button"
              >
                {t('settings.test', currentLanguage)}
              </button>
            </div>
            <small className="help-text">
              {t('settings.apiKeyHelp', currentLanguage)}
            </small>
          </div>
        </div>

        <div className="settings-section">
          <h2>⚙️ {t('settings.preferences', currentLanguage)}</h2>
          
          <div className="form-group">
            <label htmlFor="language">{t('settings.language', currentLanguage)}</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'zh-CN' | 'en-US' }))}
              className="language-select"
            >
              <option value="en-US">{t('language.english', currentLanguage)}</option>
              <option value="zh-CN">{t('language.chinese', currentLanguage)}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
              />
              <span>{t('settings.notifications', currentLanguage)}</span>
            </label>
          </div>
        </div>

        <div className="actions">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="save-button"
          >
            {saving ? t('settings.saving', currentLanguage) : t('settings.saveSettings', currentLanguage)}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
            {message}
          </div>
        )}

        <div className="info-section">
          <h3>📋 {t('settings.apiUsageInfo', currentLanguage)}</h3>
          <ul>
            <li><strong>{t('settings.model', currentLanguage)}</strong> {t('settings.modelValue', currentLanguage)}</li>
            <li><strong>{t('settings.features', currentLanguage)}</strong> {t('settings.featuresValue', currentLanguage)}</li>
            <li><strong>{t('settings.cost', currentLanguage)}</strong> {t('settings.costValue', currentLanguage)}</li>
            <li><strong>{t('settings.security', currentLanguage)}</strong> {t('settings.securityValue', currentLanguage)}</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Settings;