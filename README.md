<div align="center">

# ✨ Journaling

### AI-Powered Personal Journaling Platform

*Capture moments, track progress, unlock insights*

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.3-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Grok-3](https://img.shields.io/badge/AI-Grok--3-FF6B6B?style=for-the-badge&logo=x)](https://x.ai)

[**🌐 Live Site**](https://journaling.tech) · [**📱 Launch App**](https://app.journaling.tech) · [**📖 Documentation**](#-getting-started)

---

<img src="https://img.shields.io/badge/status-production-success?style=flat-square" alt="Status" />
<img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Journaling** is a modern, AI-powered personal journaling platform that transforms daily reflections into meaningful insights. Powered by **Grok-3** AI, it analyzes your entries to identify emotional patterns, track personal growth, and provide personalized suggestions.

### Why Journaling?

| Problem | Solution |
|---------|----------|
| Journaling feels like a chore | Beautiful, distraction-free writing experience |
| Hard to see patterns in your thoughts | AI-powered pattern recognition & weekly insights |
| Difficult to maintain consistency | Streak tracking, achievements, and gamification |
| Privacy concerns with cloud journals | Firebase security rules + encrypted data |
| Generic journaling apps | Personalized AI therapist (Dr. Maya Chen) insights |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Smart Journal Editor
- **Rich Text Editor** with auto-resize
- **20+ Mood Options** with intuitive icons
- **Smart Hashtags** for organization
- **Auto-Save** - never lose a thought
- **Weather Integration** - automatic context

</td>
<td width="50%">

### 🧠 AI-Powered Insights
- **Deep Entry Analysis** - personalized feedback
- **Weekly Summaries** - emotional patterns
- **Pattern Recognition** - identify trends
- **Growth Tracking** - monitor progress
- **Actionable Suggestions** - practical advice

</td>
</tr>
<tr>
<td width="50%">

### 📊 Analytics & Progress
- **Mood Trends** visualization
- **Tag Cloud** for topic insights
- **Streak Tracking** with fire 🔥
- **Achievement Badges** system
- **Timeline Navigation**

</td>
<td width="50%">

### 🔐 Privacy & Security
- **Google OAuth** authentication
- **Firebase Security Rules**
- **Server-side API Keys**
- **GDPR Compliant**

</td>
</tr>
</table>

### 🎨 Additional Features

- **🌓 Dark/Light Mode** - Automatic theme switching
- **📱 Fully Responsive** - Mobile-first design
- **🌤️ Weather Widget** - Location-aware weather
- **👤 Public Profiles** - Share your journey (optional)
- **🔗 Embeddable Widgets** - Showcase your stats
- **⚡ Offline Support** - Firebase persistence

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Beautiful icons |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| **Firebase Auth** | Google OAuth authentication |
| **Cloud Firestore** | Real-time NoSQL database |
| **Grok-3 (xAI)** | AI-powered journal analysis |
| **OpenWeather API** | Weather data integration |
| **Vercel** | Deployment & hosting |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │  Components │  │   Context   │         │
│  │  /entries   │  │  JournalEditor│ │  AuthContext│         │
│  │  /insights  │  │  InsightsPage │ │JournalContext│        │
│  │  /settings  │  │  SettingsPage │ │ ThemeContext│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES (Server)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ /api/analyze│  │ /api/weather│  │/api/profile │         │
│  │  (AI + Keys)│  │  (Weather)  │  │  (Public)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Firebase   │  │  GitHub     │  │ OpenWeather │         │
│  │  Firestore  │  │  Models API │  │     API     │         │
│  │    Auth     │  │  (Grok-3)   │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn**
- **Firebase Project** with Firestore enabled
- **GitHub Token** with Models API access
- **OpenWeather API Key** (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Cyb3rWo9f/Journaling.tech.git
cd Journaling.tech

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# ============================================
# SERVER-SIDE ONLY (Secure - Never exposed)
# ============================================

# GitHub Models API (for Grok-3 AI)
GITHUB_TOKEN=your_github_personal_access_token

# Weather API
OPENWEATHER_API_KEY=your_openweather_api_key

# ============================================
# CLIENT-SIDE (Safe to expose)
# ============================================

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# App Configuration
NEXT_PUBLIC_APP_NAME=Journaling
NEXT_PUBLIC_APP_URL=https://app.journaling.tech
NEXT_PUBLIC_LANDING_URL=https://journaling.tech
```

### Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | ✅ Yes | GitHub PAT with Models API access |
| `OPENWEATHER_API_KEY` | ❌ Optional | For weather widget |
| `NEXT_PUBLIC_FIREBASE_*` | ✅ Yes | Firebase project config |
| `NEXT_PUBLIC_APP_URL` | ❌ Optional | Production app URL |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Login, UserProfile
│   ├── insights/       # InsightsPage, AI summaries
│   ├── journal/        # JournalEditor, EntriesPage
│   ├── landing/        # Landing page components
│   ├── layout/         # Layout wrapper
│   ├── settings/       # Settings, Profile cards
│   ├── ui/             # Reusable UI components
│   └── widgets/        # Weather widgets
├── context/
│   ├── AuthContext.tsx     # Authentication state
│   ├── JournalContext.tsx  # Journal entries state
│   └── ThemeContext.tsx    # Dark/light mode
├── hooks/
│   └── useAutoSave.ts      # Auto-save hook
├── lib/
│   └── firebase.ts         # Firebase initialization
├── pages/
│   ├── api/
│   │   ├── analyze.ts      # AI analysis (protected prompts)
│   │   ├── weather.ts      # Weather API proxy
│   │   └── profile/        # Public profile API
│   ├── embed/              # Embeddable widgets
│   ├── u/                  # Public profile pages
│   ├── entries.tsx         # Entries page
│   ├── insights.tsx        # Insights page
│   ├── settings.tsx        # Settings page
│   ├── landing.tsx         # Landing page
│   └── index.tsx           # Main app page
├── services/
│   ├── ai.ts               # AI service client
│   ├── firebase.ts         # Firestore operations
│   ├── freeWeatherService.ts
│   └── storage.ts          # LocalStorage helpers
├── styles/
│   └── globals.css         # Global styles + CSS variables
├── types/
│   └── index.ts            # TypeScript interfaces
├── utils/
│   ├── index.ts            # Utility functions
│   └── logger.ts           # Production-safe logger
└── middleware.ts           # Domain routing
```

---

## 🔒 Security

Your privacy and data security are our top priorities:

- **🔐 Secure Authentication** - Google OAuth 2.0 with Firebase
- **🛡️ Data Encryption** - All data encrypted in transit and at rest
- **👤 User Isolation** - Your journal entries are only accessible by you
- **🚫 No Data Selling** - We never sell or share your personal data
- **📋 GDPR Compliant** - Full data export and deletion support

---

## 🌐 Deployment

The application is deployed on **Vercel** with automatic CI/CD from the main branch.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Cyb3rWo9f/Journaling.tech&env=GITHUB_TOKEN,OPENWEATHER_API_KEY,NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID&project-name=journaling&repository-name=journaling)

- **Production**: [journaling.tech](https://journaling.tech)
- **App**: [app.journaling.tech](https://app.journaling.tech)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test on both light and dark modes
- Ensure mobile responsiveness

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by Cyb3rWo9f**

[🌐 Website](https://journaling.tech) · [🐛 Report Bug](https://github.com/Cyb3rWo9f/Journaling.tech/issues) · [✨ Request Feature](https://github.com/Cyb3rWo9f/Journaling.tech/issues)

</div>
