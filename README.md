<div align="center">

# 🌟 AI Journaling Application

*Transform your thoughts into insights with the power of AI*

[![Next.js](https://img.shields.io/badge/Next.js-13.4.19-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-GPT--4-green?style=for-the-badge&logo=openai)](https://openai.com)

**🚀 [Live Demo](https://journling.vercel.app) | 📖 [Documentation](#installation) | 🎯 [Features](#features)**

</div>

---

A modern, intelligent journaling platform that combines personal reflection with AI-powered insights to help you track your thoughts, emotions, and personal growth journey.

> *"The life of every man is a diary in which he means to write one story, and writes another."* - J.M. Barrie

## 🎯 Why Choose AI Journaling?

Transform your daily reflections into powerful insights with cutting-edge AI technology. Whether you're seeking emotional clarity, tracking personal growth, or building a consistent journaling habit, our platform adapts to your unique journey.

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Smart Journal Editor
- 🎨 **Rich Text Editor** - Responsive, auto-resizing interface
- 😊 **Mood Tracking** - 20+ emotional states with intuitive icons
- 🏷️ **Smart Hashtags** - Intelligent tag suggestions & organization
- 💾 **Auto-Save Magic** - Never lose a thought again
- 🌤️ **Weather Context** - Automatic environmental data capture

</td>
<td width="50%">

### 🧠 AI-Powered Insights
- 🔍 **Deep Analysis** - Personalized insights for every entry
- 📊 **Weekly Summaries** - Comprehensive emotional & thematic analysis
- 🔄 **Pattern Recognition** - Identify trends & recurring themes
- 📈 **Growth Tracking** - Monitor your personal development
- 💡 **Smart Suggestions** - Actionable feedback & motivation

</td>
</tr>

<tr>
<td width="50%">

### 📊 Analytics & Visualization
- 📈 **Mood Analytics** - Beautiful emotional pattern charts
- ☁️ **Tag Cloud** - Visualize your most frequent topics
- 🔥 **Streak Tracking** - Gamified consistency monitoring
- ⏰ **Timeline View** - Navigate your journal history
- 🏆 **Achievement System** - Unlock milestones & badges

</td>
<td width="50%">

### 🔐 Security & Privacy
- 🔒 **Google OAuth** - Enterprise-grade authentication
- ☁️ **Firebase Backend** - Reliable, scalable cloud storage
- 🛡️ **Privacy First** - Your data is encrypted & private
- ⚙️ **Full Control** - Complete account & data management
- 🌐 **GDPR Compliant** - Transparent data handling

</td>
</tr>
</table>

---

## 🚀 Technology Stack

<div align="center">

### Frontend Excellence
![Next.js](https://img.shields.io/badge/Next.js-13.4.19-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.6-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.3-06B6D4?style=flat-square&logo=tailwind-css)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23.16-FF0055?style=flat-square&logo=framer)

### Backend & Services
![Firebase](https://img.shields.io/badge/Firebase-12.3.0-FFCA28?style=flat-square&logo=firebase)
![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-GPT--4-00A1F1?style=flat-square&logo=microsoft-azure)
![OpenWeather](https://img.shields.io/badge/OpenWeather-API-FF8C00?style=flat-square&logo=weather-api)

### Development Tools
![ESLint](https://img.shields.io/badge/ESLint-8.45.0-4B32C3?style=flat-square&logo=eslint)
![PostCSS](https://img.shields.io/badge/PostCSS-8.4.27-DD3A0A?style=flat-square&logo=postcss)

</div>

---

## 🎨 User Experience Highlights

<div align="center">

| 🌙 **Dark/Light Mode** | 📱 **Responsive Design** | ✨ **Glass Morphism UI** |
|:---:|:---:|:---:|
| Seamless theme switching | Perfect on all devices | Modern, beautiful interface |
| **🎭 Smooth Animations** | **📱 PWA Ready** | **⚡ Lightning Fast** |
| Framer Motion powered | Install like native app | Optimized performance |

</div>

---

## 📦 Installation

### 🔧 Prerequisites
```bash
✅ Node.js 16.0+
✅ npm or yarn
✅ Firebase project (free tier)
✅ Azure OpenAI account (optional)
✅ OpenWeather API key (optional)
```

### 🚀 Quick Start

1. **Clone & Setup**
```bash
git clone https://github.com/CyberWo9f-xD/Journling.git
cd Journling
npm install
```

2. **Environment Configuration**
```bash
# Copy the example environment file
cp .env.example .env.local
```

3. **Configure Environment Variables**
```env
# 🔥 Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# 🤖 Azure OpenAI Configuration (Optional - for AI insights)
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.cognitiveservices.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-12-01-preview

# 🌤️ Weather Integration (Optional)
OPENWEATHER_API_KEY=your_openweather_api_key

# ⚙️ App Configuration
NEXT_PUBLIC_APP_NAME=AI Journaling
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Launch Development Server**
```bash
npm run dev
# Visit: http://localhost:3000
```

---



## 🌐 Deploy to Vercel - Free Hosting

<div align="center">

### 🚀 **One-Click Deployment**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/CyberWo9f-xD/Journling&project-name=journling-app&repository-name=journling-app)

**Click the button above for instant deployment!**

</div>

### 📋 Manual Deployment Steps

1. **Push your changes to GitHub** (if you made any modifications)
```bash
git add .
git commit -m "Update configuration for deployment"
git push origin main
```

2. **Visit [Vercel.com](https://vercel.com)** and sign in with GitHub

3. **Import your repository:**
   - Click "New Project"
   - Import `CyberWo9f-xD/Journling`
   - Select the root directory

4. **Configure Environment Variables:**
   - Add all your environment variables from `.env.local`
   - Make sure to set the correct Firebase configuration

5. **Deploy!** 
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`

---

## 🔑 Environment Variables for Vercel

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | 🔴 **Required** | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 🔴 **Required** | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 🔴 **Required** | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | 🔴 **Required** | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | 🔴 **Required** | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 🔴 **Required** | Firebase app ID |
| `AZURE_OPENAI_API_KEY` | 🟡 **Optional** | For AI insights |
| `AZURE_OPENAI_ENDPOINT` | 🟡 **Optional** | Azure OpenAI endpoint |
| `OPENWEATHER_API_KEY` | 🟡 **Optional** | For weather widget |

---

## 🏗️ Project Architecture

<details>
<summary><strong>📁 Click to expand project structure</strong></summary>

```
src/
├── 🔐 components/          # React components
│   ├── auth/              # 🔑 Authentication components
│   ├── journal/           # ✍️ Journal editor and related
│   ├── insights/          # 🧠 AI insights and analytics
│   ├── layout/            # 🏗️ Layout and navigation
│   ├── settings/          # ⚙️ User settings and profile
│   ├── ui/                # 🎨 Reusable UI components
│   └── widgets/           # 🌤️ Weather and other widgets
├── 🔄 context/            # React context providers
│   ├── AuthContext.tsx    # 🔑 Authentication state
│   ├── JournalContext.tsx # 📖 Journal data management
│   └── ThemeContext.tsx   # 🌗 Theme management
├── 🪝 hooks/              # Custom React hooks
├── 📚 lib/                # Library configurations
├── 📄 pages/              # Next.js pages
├── 🔧 services/           # External service integrations
├── 🎨 styles/             # Global styles
├── 📝 types/              # TypeScript type definitions
└── 🛠️ utils/              # Utility functions
```

</details>

---

## 🎮 Feature Walkthrough

<table>
<tr>
<td width="20%" align="center"><strong>🚪 Step 1</strong><br/>Getting Started</td>
<td width="20%" align="center"><strong>✍️ Step 2</strong><br/>Writing Experience</td>
<td width="20%" align="center"><strong>🧠 Step 3</strong><br/>AI Insights</td>
<td width="20%" align="center"><strong>📊 Step 4</strong><br/>Analytics</td>
<td width="20%" align="center"><strong>⚙️ Step 5</strong><br/>Customization</td>
</tr>
<tr>
<td>• Sign in with Google<br/>• Start first entry<br/>• Add mood & tags</td>
<td>• Rich text editor<br/>• Auto-save magic<br/>• Weather capture</td>
<td>• Entry analysis<br/>• Weekly summaries<br/>• Growth insights</td>
<td>• Streak tracking<br/>• Mood trends<br/>• Tag visualization</td>
<td>• Profile setup<br/>• Achievement badges<br/>• Theme preferences</td>
</tr>
</table>

---

## 🗺️ Roadmap & Future Features

<div align="center">

### 🎯 **Coming Soon**

</div>

| 🚀 **Q1 2025** | 🔮 **Q2 2025** | 🌟 **Future** |
|:---:|:---:|:---:|
| 📄 PDF Export | 🎤 Voice-to-text | 👥 Collaborative journaling |
| 📱 Mobile App | 💪 Fitness integration | 🧘 Meditation features |
| 🔍 Advanced search | 📊 Enhanced analytics | 🤖 AI coaching |

---

## 🤝 Contributing & Community

<div align="center">

[![Contributors](https://img.shields.io/github/contributors/CyberWo9f-xD/Journling?style=for-the-badge)](https://github.com/CyberWo9f-xD/Journling/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/CyberWo9f-xD/Journling?style=for-the-badge)](https://github.com/CyberWo9f-xD/Journling/issues)
[![Stars](https://img.shields.io/github/stars/CyberWo9f-xD/Journling?style=for-the-badge)](https://github.com/CyberWo9f-xD/Journling/stargazers)

**We welcome contributions! 🎉**

</div>

1. 🍴 **Fork the repository**
2. 🌿 **Create a feature branch**
3. 💻 **Make your changes**
4. ✅ **Add tests if applicable**
5. 🚀 **Submit a pull request**

---

## 🆘 Support & Resources

<div align="center">

| 📚 **Documentation** | 🐛 **Issues** | 💬 **Discussions** | 📧 **Contact** |
|:---:|:---:|:---:|:---:|
| [Read the Docs](#) | [Report Bugs](../../issues) | [Join Community](#) | [Email Support](#) |

</div>

---

## 📄 License & Credits

<div align="center">

**MIT License** - Feel free to use this project for personal or commercial purposes

### 🙏 **Acknowledgments**

[![OpenAI](https://img.shields.io/badge/Powered_by-OpenAI-00A67E?style=flat-square&logo=openai)](https://openai.com)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Hosted_on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)

*Special thanks to the open-source community for making this project possible*

</div>

---

<div align="center">

## 💝 **Made with ❤️ for better mental health and personal growth**

### ⭐ **If this project helped you, consider giving it a star!**

[![GitHub Stars](https://img.shields.io/github/stars/CyberWo9f-xD/Journling?style=social)](https://github.com/CyberWo9f-xD/Journling/stargazers)

---

*"The life of every man is a diary in which he means to write one story, and writes another."* - **J.M. Barrie**

</div>