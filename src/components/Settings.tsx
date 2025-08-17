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

// Simple translation dictionary for English and Chinese
const translations = {
  'en-US': {
    accountSettings: 'Account Settings',
    backToUpload: '\u2190 Back to Upload',
    logout: 'Logout',
    apiConfiguration: '\ud83d\udd11 API Configuration',
    apiDescription:
      'Configure your own Doubao API key for homework analysis. Get your API key from',
    apiConsole: 'Volcengine ARK Console',
    apiKeyLabel: 'Doubao API Key',
    test: 'Test',
    helpText:
      "Your API key is stored locally and never shared. Without a key, you'll use the demo mode.",
    preferences: '\u2699\ufe0f Preferences',
    language: 'Language',
    optionChinese: '\u4e2d\u6587 (Chinese)',
    optionEnglish: 'English',
    enableNotifications: 'Enable notifications',
    saveSettings: 'Save Settings',
    saving: 'Saving...',
    savedSuccess: 'Settings saved successfully!',
    invalidApiKeyFormat: 'Invalid API key format. Please check your key.',
    pleaseEnterApiKeyFirst: 'Please enter an API key first',
    testingApiKey: 'Testing API key...',
    invalidApiKey: '\u274c Invalid API key',
    apiKeyQuotaExceeded: '\u26a0\ufe0f API key valid but quota exceeded',
    apiKeyValid: '\u2705 API key is valid',
    unexpectedResponse: '\u26a0\ufe0f Unexpected response:',
    networkError: '\u274c Network error or invalid API key',
    apiUsageInfo: '\ud83d\udccb API Usage Information',
    model: 'Model:',
    features: 'Features:',
    featuresDesc: 'Chinese text recognition, error detection',
    cost: 'Cost:',
    costDesc: 'Pay-per-use based on your Volcengine plan',
    security: 'Security:',
    securityDesc: 'API key stored locally, not on our servers',
  },
  'zh-CN': {
    accountSettings: '\u8d26\u6237\u8bbe\u7f6e',
    backToUpload: '\u2190 \u8fd4\u56de\u4e0a\u4f20',
    logout: '\u9000\u51fa\u767b\u5f55',
    apiConfiguration: '\ud83d\udd11 API\u914d\u7f6e',
    apiDescription: '\u914d\u7f6e\u60a8\u7684\u8c46\u5305API\u5bc6\u94a5\u7528\u4e8e\u4f5c\u4e1a\u5206\u6790\u3002\u83b7\u53d6API\u5bc6\u94a5\u8bf7\u8bbf\u95ee',
    apiConsole: '\u706b\u5c71\u5f15\u64ceARK\u63a7\u5236\u53f0',
    apiKeyLabel: '\u8c46\u5305 API \u5bc6\u94a5',
    test: '\u6d4b\u8bd5',
    helpText:
      '\u60a8\u7684API\u5bc6\u94a5\u4ec5\u5b58\u50a8\u5728\u672c\u5730\uff0c\u7edd\u4e0d\u4f1a\u5171\u4eab\u3002\u6ca1\u6709\u5bc6\u94a5\u5c06\u4f7f\u7528\u6f14\u793a\u6a21\u5f0f\u3002',
    preferences: '\u2699\ufe0f \u504f\u597d\u8bbe\u7f6e',
    language: '\u8bed\u8a00',
    optionChinese: '\u4e2d\u6587 (Chinese)',
    optionEnglish: '\u82f1\u6587 (English)',
    enableNotifications: '\u542f\u7528\u901a\u77e5',
    saveSettings: '\u4fdd\u5b58\u8bbe\u7f6e',
    saving: '\u4fdd\u5b58\u4e2d...',
    savedSuccess: '\u8bbe\u7f6e\u4fdd\u5b58\u6210\u529f\uff01',
    invalidApiKeyFormat: 'API\u5bc6\u94a5\u683c\u5f0f\u65e0\u6548\uff0c\u8bf7\u68c0\u67e5\u60a8\u7684\u5bc6\u94a5\u3002',
    pleaseEnterApiKeyFirst: '\u8bf7\u5148\u8f93\u5165API\u5bc6\u94a5',
    testingApiKey: '\u6b63\u5728\u6d4b\u8bd5API\u5bc6\u94a5...',
    invalidApiKey: '\u274c \u65e0\u6548\u7684API\u5bc6\u94a5',
    apiKeyQuotaExceeded: '\u26a0\ufe0f API\u5bc6\u94a5\u6709\u6548\u4f46\u989d\u5ea6\u5df2\u7528\u5b8c',
    apiKeyValid: '\u2705 API\u5bc6\u94a5\u6709\u6548',
    unexpectedResponse: '\u26a0\ufe0f \u610f\u5916\u54cd\u5e94:',
    networkError: '\u274c \u7f51\u7edc\u9519\u8bef\u6216\u65e0\u6548API\u5bc6\u94a5',
    apiUsageInfo: '\ud83d\udccb API \u4f7f\u7528\u4fe1\u606f',
    model: '\u6a21\u578b:',
    features: '\u7279\u6027:',
    featuresDesc: '\u4e2d\u6587\u6587\u672c\u8bc6\u522b\uff0c\u9519\u8bef\u68c0\u6d4b',
    cost: '\u8d39\u7528:',
    costDesc: '\u6839\u636e\u706b\u5c71\u5f15\u64ce\u5957\u9910\u6309\u91cf\u8ba1\u8d39',
    security: '\u5b89\u5168:',
    securityDesc: 'API\u5bc6\u94a5\u4ec5\u5b58\u5728\u672c\u5730\uff0c\u4e0d\u4f1a\u4e0a\u4f20\u5230\u670d\u52a1\u5668',
  },
};

type TranslationKey = keyof typeof translations['en-US'];

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

  const t = (key: TranslationKey): string => translations[settings.language][key];

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
        throw new Error(t('invalidApiKeyFormat'));
      }

      // Save to localStorage (in production, this would be saved to your backend)
      localStorage.setItem(`userSettings_${user.id}`, JSON.stringify(settings));

      setMessage(t('savedSuccess'));
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('networkError'));
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
      setMessage(t('pleaseEnterApiKeyFirst'));
      return;
    }

    setSaving(true);
    setMessage(t('testingApiKey'));

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
        setMessage(t('invalidApiKey'));
      } else if (response.status === 429) {
        setMessage(t('apiKeyQuotaExceeded'));
      } else if (response.ok || response.status === 400) {
        setMessage(t('apiKeyValid'));
      } else {
        setMessage(`${t('unexpectedResponse')} ${response.status}`);
      }
    } catch (error) {
      setMessage(t('networkError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <h1>{t('accountSettings')}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/upload')} className="back-button">
            {t('backToUpload')}
          </button>
          <div className="user-info">
            <span>{settings.language === 'zh-CN' ? `欢迎, ${user.username}` : `Welcome, ${user.username}`}</span>
            <button onClick={onLogout} className="logout-button">{t('logout')}</button>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-section">
          <h2>{t('apiConfiguration')}</h2>
          <p className="section-description">
            {t('apiDescription')}
            <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer"> {t('apiConsole')}</a>.
          </p>

          <div className="form-group">
            <label htmlFor="apiKey">{t('apiKeyLabel')}</label>
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
                {t('test')}
              </button>
            </div>
            <small className="help-text">
              {t('helpText')}
            </small>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t('preferences')}</h2>

          <div className="form-group">
            <label htmlFor="language">{t('language')}</label>
            <select
              id="language"
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'zh-CN' | 'en-US' }))}
              className="language-select"
            >
              <option value="zh-CN">{t('optionChinese')}</option>
              <option value="en-US">{t('optionEnglish')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
              />
              <span>{t('enableNotifications')}</span>
            </label>
          </div>
        </div>

        <div className="actions">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="save-button"
          >
            {saving ? t('saving') : t('saveSettings')}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
            {message}
          </div>
        )}

        <div className="info-section">
          <h3>{t('apiUsageInfo')}</h3>
          <ul>
            <li><strong>{t('model')}</strong> doubao-seed-1-6-flash-250715</li>
            <li><strong>{t('features')}</strong> {t('featuresDesc')}</li>
            <li><strong>{t('cost')}</strong> {t('costDesc')}</li>
            <li><strong>{t('security')}</strong> {t('securityDesc')}</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Settings;