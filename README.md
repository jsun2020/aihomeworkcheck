# AI Homework Checker

AI-powered Chinese homework checking web application using Doubao API.

## Features

- **Login/Sign Up**: Secure user authentication
- **Photo Upload**: Upload homework images for analysis
- **AI Analysis**: Real-time Chinese text recognition and error detection
- **Results Display**: Original image with detailed analysis results
- **Accuracy Calculation**: Precise writing accuracy percentage

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your ARK API key:
   ```
   PORT=3002
   REACT_APP_ARK_API_KEY=your_actual_api_key_here
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Open Browser**
   Navigate to `http://localhost:3002`

## User Features

### Account Settings
- **Custom API Key**: Users can configure their own Doubao API key
- **Settings Page**: Access via ⚙️ Settings button in the upload page
- **API Key Testing**: Verify API key validity before saving
- **Local Storage**: API keys stored securely in browser (not on servers)

### API Key Priority
1. **User's Custom Key** (highest priority)
2. **Environment Variable** (fallback)
3. **Error** if no key available

## Deployment

### Vercel Deployment
1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel**
   - Import project from GitHub
   - Set environment variable: `REACT_APP_ARK_API_KEY`
   - Deploy automatically

3. **Cloudflare Pages**
   - Connect GitHub repository
   - Build command: `npm run build`
   - Build output directory: `build`
   - Environment variable: `REACT_APP_ARK_API_KEY`

### Environment Variables
```
REACT_APP_ARK_API_KEY=your_production_api_key
```

## API Integration

This application uses the Doubao API (`doubao-seed-1-6-flash-250715`) for Chinese text recognition:
- **Endpoint**: `https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- **Authentication**: Bearer token via ARK_API_KEY
- **Features**: Multi-modal image analysis with Chinese text expertise

## Accuracy Formula

```
Accuracy = (Total Characters - Issues Found) / Total Characters × 100%
```

## Security

- ⚠️ **Never commit `.env` file** - Contains sensitive API keys
- ✅ **Use `.env.example`** - Template for configuration
- ✅ **API keys are excluded** - Added to `.gitignore`

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router
- **Styling**: CSS Modules
- **API**: Doubao Vision API
- **Build**: Create React App

---
Built with Claude Code 🤖