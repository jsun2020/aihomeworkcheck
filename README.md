# AI作业检查器 / AI Homework Checker

一个基于React和豆包AI的智能中文作业错别字检测系统。

## 🌟 功能特性

- **智能错别字检测**：使用豆包AI模型识别中文作业中的错别字
- **多语言支持**：支持中文和英文界面切换
- **免费试用**：提供10次免费使用的演示模式
- **API密钥保护**：安全的密钥管理，防止复制和泄露
- **实时分析**：快速图片上传和分析处理
- **详细报告**：提供完整的错误分析和建议

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/jsun2020/aihomeworkcheck.git
cd aihomeworkcheck
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm start
```

4. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 📖 使用指南

### 1. 登录系统
- 使用任意用户名和密码登录（演示版本）
- 系统会自动创建用户账户

### 2. 上传作业图片
- 支持拖拽上传或点击选择文件
- 支持常见图片格式（JPG、PNG、GIF等）
- 系统会自动压缩图片以提高处理速度

### 3. 分析结果
- 查看完整的文字转录
- 查看错别字检测结果
- 获得详细的错误类型和建议

### 4. 设置API密钥
- 前往设置页面配置您的豆包API密钥
- 获取API密钥：[火山引擎ARK控制台](https://console.volcengine.com/ark)
- 测试API密钥有效性

## 🔧 配置说明

### API密钥配置

1. **获取API密钥**
   - 访问 [火山引擎ARK控制台](https://console.volcengine.com/ark)
   - 注册账户并创建API密钥
   - 确保有足够的配额用于API调用

2. **配置密钥**
   - 在应用中点击"设置"按钮
   - 输入您的API密钥
   - 点击"测试"验证密钥有效性
   - 保存设置

### 演示模式
- 新用户默认有10次免费使用机会
- 演示模式提供模拟的分析结果
- 超出限制后需要配置真实API密钥

## 🏗️ 部署指南

### 本地构建

```bash
# 构建生产版本
npm run build

# 使用静态服务器运行
npm install -g serve
serve -s build
```

### Vercel部署

1. **准备部署**
```bash
npm install -g vercel
```

2. **部署到Vercel**
```bash
vercel --prod
```

3. **环境变量配置**（可选）
在Vercel控制台中设置：
- `REACT_APP_ARK_API_KEY`：默认API密钥

### Netlify部署

1. **构建设置**
   - Build command: `npm run build`
   - Publish directory: `build`

2. **拖拽部署**
   - 将`build`文件夹拖拽到Netlify部署页面

### Docker部署

1. **创建Dockerfile**
```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **构建和运行**
```bash
docker build -t ai-homework-checker .
docker run -p 80:80 ai-homework-checker
```

## 🛠️ 开发指南

### 项目结构

```
src/
├── components/          # React组件
│   ├── Login.tsx       # 登录组件
│   ├── Upload.tsx      # 上传组件
│   ├── Results.tsx     # 结果显示组件
│   └── Settings.tsx    # 设置组件
├── services/           # API服务
│   └── doubaoAPI.ts    # 豆包API集成
├── utils/              # 工具函数
│   ├── i18n.ts         # 国际化支持
│   └── usageTracker.ts # 使用次数跟踪
└── App.tsx             # 主应用组件
```

### 可用脚本

- `npm start` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm test` - 运行测试
- `npm run eject` - 弹出配置（不可逆）

### 技术栈

- **前端框架**：React 18 + TypeScript
- **路由**：React Router v6
- **样式**：CSS3 + Flexbox
- **AI服务**：豆包API (Doubao)
- **构建工具**：Create React App

## 🔒 安全说明

- API密钥仅存储在浏览器本地存储中
- 不会将API密钥发送到任何第三方服务器
- 图片数据仅发送到豆包API进行分析
- 支持图片压缩以减少数据传输

## 📝 更新日志

### v1.4.0 (最新)
- ✨ 修复一些小bug，提升用户体验

### v1.3.0
- ✨ 增加试用的API key

### v1.2.0 
- ✨ 优化API调用速度，减少等待时间
- ✨ 添加图片压缩功能
- ✨ 增加超时控制和错误处理
- ✨ 改进进度提示显示
- 🐛 修复TypeScript编译错误

### v1.1.0
- ✨ 完整的中英文国际化支持
- ✨ API密钥保护和安全显示
- ✨ 免费试用10次功能
- ✨ 使用次数跟踪
- 🐛 修复语言切换问题

### v1.0.0
- 🎉 初始版本发布
- ✨ 基础的错别字检测功能
- ✨ 图片上传和分析
- ✨ 用户登录系统

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如果您遇到问题或有建议，请：

1. 查看 [Issues](https://github.com/jsun2020/aihomeworkcheck/issues)
2. 创建新的 Issue
3. 联系开发团队

## 🙏 致谢

- [豆包AI](https://www.volcengine.com/product/doubao) - 提供强大的AI分析能力
- [React](https://reactjs.org/) - 优秀的前端框架
- [Create React App](https://create-react-app.dev/) - 快速项目搭建工具

---

**注意**：本项目仅用于教育和学习目的。请确保遵守相关API服务的使用条款。