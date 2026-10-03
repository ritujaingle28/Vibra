<div align="center">

# 🎵 VIBRA
### Next-Generation AI Music Streaming, Retro Cassette Lab & Social Studio

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black&style=for-the-badge)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v11-FFCA28?logo=firebase&logoColor=black&style=for-the-badge)](https://firebase.google.com/)
[![Google GenAI](https://img.shields.io/badge/Google_GenAI-Lyria_3-4285F4?logo=google&logoColor=white&style=for-the-badge)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

<img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80" alt="Vibra Hero Banner" width="100%" style="border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);" />

<p align="center">
  <strong>An enterprise-grade, client-cloud music platform integrating Google Lyria AI for generative composition, nostalgic skeumorphic cassette mixtapes, synchronized lyrics engine, and role-based real-time cloud persistence.</strong>
</p>

[Explore Features](#-feature-architecture) • [System Architecture](#-system-architecture) • [Security & RBAC](#-security-model--rbac) • [Database Schema](#-firestore-database-blueprint) • [Setup Guide](#-installation--local-development)

</div>

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [System Architecture](#-system-architecture)
3. [Feature Architecture](#-feature-architecture)
4. [Security Model & RBAC](#-security-model--rbac)
5. [Firestore Database Blueprint](#-firestore-database-blueprint)
6. [Tech Stack Matrix](#-tech-stack-matrix)
7. [Installation & Local Development](#-installation--local-development)
8. [Performance Optimizations](#-performance-optimizations)
9. [Directory Structure](#-directory-structure)
10. [License](#-license)

---

## 🔭 Overview

**Vibra** redefines personal streaming by bridging three distinct paradigms:
1. **Zero-Latency Streaming**: Cloud-accelerated audio streaming with continuous queue management, crossfade capabilities, and reactive scrubbing.
2. **Generative Composition**: Native integration with Google Lyria models enabling multimodal prompt-to-music and image-to-music generation with synthesized metadata, cover art, and lyrics.
3. **Physical-to-Digital Nostalgia**: A high-fidelity retro cassette mixtape lab allowing users to assemble personalized mixtapes with hand-written notes, custom reel themes, and shareable deep links.

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   UI Components &     │  │  PlayerContext  │  │   Audio Engine   │  │
│  │   Motion Viewports    │◄─┼─ (Global State) │◄─┼─ (HTML5 / Web)   │  │
│  └──────────┬────────────┘  └────────┬────────┘  └──────────────────┘  │
└─────────────┼────────────────────────┼─────────────────────────────────┘
              │                        │
              ▼                        ▼
┌───────────────────────────┐ ┌──────────────────────────────────────────┐
│    GOOGLE GENAI SERVICE   │ │             FIREBASE PLATFORM            │
│  ┌─────────────────────┐  │ │  ┌───────────────┐   ┌────────────────┐  │
│  │  Lyria Music Model  │  │ │  │ Firebase Auth │   │ Cloud Firestore│  │
│  │  (Text / Image)     │  │ │  │ (Google/Email)│   │ (Security Rules│  │
│  └─────────────────────┘  │ │  └───────┬───────┘   │  Enforced RBAC)│  │
│  ┌─────────────────────┐  │ │          │           └───────▲────────┘  │
│  │  Gemini Track Meta  │  │ │          ▼                   │           │
│  │  (Lyrics & Genres)  │  │ │  ┌───────────────┐           │           │
│  └─────────────────────┘  │ │  │ JWT Validation├───────────┘           │
└───────────────────────────┘ │  │ & Admin Claims│                       │
                              │  └───────────────┘                       │
                              └──────────────────────────────────────────┘
```

---

## ✨ Feature Architecture

### 1. Adaptive Full-Screen Audio Player
* **Engine**: Dual-pipeline buffering combining direct streams with YouTube Media API fallbacks.
* **Synchronized Lyrics**: Millisecond-accurate timestamp parser tracking lyrical lines with active auto-scrolling and vocal highlights.
* **Hardware MediaSession API**: Native OS-level lock screen and media key integration (Play/Pause, Seek, Prev/Next, Title, Artist, Album Artwork).
* **Smart Queue**: Drag-and-drop playlist reordering, non-destructive shuffle algorithm, and smart auto-play queue continuations.

### 2. Generative Lyria Music Composer
* **Prompt Synthesis**: Translates freeform natural language into musical composition parameters (Key, Scale, Tempo, Instrumentation, Era Vibe).
* **Multimodal Image-to-Song**: Extracts palette, mood, and semantics from uploaded user photography to generate corresponding musical themes.
* **Track Synthesis Pipeline**:
  ```text
  User Prompt / Image ──▶ Gemini Multimodal Vision ──▶ Parameter Normalizer
                                                                │
  Local Library Storage ◀── Cover Art & Lyrics ◀── Lyria Audio Engine
  ```

### 3. Retro Cassette Mixtape Studio
* **Interactive 3D/Skeumorphic Cassettes**: Realistic reel rotation speed synced directly with audio playback state.
* **Customization Vector**: 6 curated retro colorways (Retro Gold, Rose Gold, Midnight, Neon Cyberpunk, Pastel Violet, Mint).
* **Deep-Link Mixtape Sharing**: Encoded payloads allow direct recipient playback with customized greeting cards and dedications.

### 4. Instagram Illustrated Avatar Studio
* **Vector Canvas Renderer**: SVG-based modular avatar generator with configurable skin tones, haircuts, expressions, and accessories.
* **Instant Export & Profile Sync**: Saves directly to Firebase Auth profile metadata and local cache.

---

## 🛡️ Security Model & RBAC

All data access is gated by cloud-enforced Firestore Security Rules with zero reliance on client-side security assertions.

### Role-Based Access Control (RBAC) Matrix

| Path / Collection | Anonymous / Guest | Authenticated User | Admin (`beatzapp.team@gmail.com`) |
| :--- | :---: | :---: | :---: |
| `/users/{uid}/liked_songs` | ❌ Denied | ✅ Owner Only (`uid == auth.uid`) | ❌ Denied (PII Protected) |
| `/users/{uid}/recent_plays` | ❌ Denied | ✅ Owner Only (`uid == auth.uid`) | ❌ Denied (PII Protected) |
| `/users/{uid}/playlists` | ❌ Denied | ✅ Owner Only (`uid == auth.uid`) | ❌ Denied (PII Protected) |
| `/users/{uid}/cassettes` | 👁️ Get Public Tape | ✅ Full CRUD (Owner) | ✅ Read Any |
| `/admin_user_logins/{loginId}` | ❌ Denied | ✍️ Write Own Login Audit Only | 👑 Full Read / List / Export |

### Fortress Firestore Rule Snippet
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.email == 'beatzapp.team@gmail.com';
    }

    // Secure Login Audit Database
    match /admin_user_logins/{loginId} {
      allow get, list: if isAdmin();
      allow create, update: if isSignedIn() && (request.auth.uid == loginId || isAdmin());
      allow delete: if isAdmin();
    }
  }
}
```

---

## 🗄️ Firestore Database Blueprint

```text
root
├── admin_user_logins/{userId}
│   ├── uid: string
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── providerId: "google.com" | "password" | "anonymous"
│   ├── loginCount: number
│   ├── firstLoginAt: timestamp (ms)
│   ├── lastLoginAt: timestamp (ms)
│   └── userAgent: string
│
└── users/{userId}
    ├── liked_songs/{trackId}
    │   ├── title: string
    │   ├── channel: string
    │   ├── thumbnail: string
    │   └── timestamp: number
    │
    ├── playlists/{playlistId}
    │   ├── name: string
    │   ├── description: string
    │   ├── coverUrl: string
    │   ├── isAIGenerated: boolean
    │   ├── prompt: string
    │   └── tracks: Track[]
    │
    └── cassettes/{cassetteId}
        ├── title: string
        ├── recipientName: string
        ├── senderName: string
        ├── note: string
        ├── themeColor: string
        ├── sticker: string
        └── tracks: Track[]
```

---

## 💻 Tech Stack Matrix

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | React 19 + TypeScript | Concurrent UI rendering with strict static typing |
| **Build Tool** | Vite 6 | Sub-second HMR and optimized tree-shaken bundles |
| **Styling** | Tailwind CSS 4 | Zero-runtime modern styling with custom container queries |
| **Animations** | Motion (Framer Motion) | Hardware-accelerated transitions & gestural interactions |
| **Cloud Auth** | Firebase Authentication | Google OAuth 2.0, Passwordless & Anonymous credentialing |
| **Cloud DB** | Google Cloud Firestore | Distributed NoSQL with real-time offline persistence |
| **AI SDK** | `@google/genai` | Native integration with Google Gemini & Lyria APIs |
| **Icons** | Google Material Symbols | Scalable vector typography symbols |

---

## 🚀 Installation & Local Development

### Prerequisites
* **Node.js**: >= 18.18.0
* **Package Manager**: npm >= 9.0.0 (or pnpm / yarn)
* **Firebase Project**: Firestore initialized in native mode

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/vibra.git
   cd vibra
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase Credentials:**
   Create a `firebase-applet-config.json` in the root directory:
   ```json
   {
     "projectId": "your-project-id",
     "appId": "your-app-id",
     "apiKey": "your-api-key",
     "authDomain": "your-project.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-project.firebasestorage.app",
     "messagingSenderId": "your-messaging-id"
   }
   ```

4. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   The application will boot at `http://localhost:3000`.

---

## ⚡ Performance Optimizations

* **Firestore Connection Resilience**: `initializeFirestore` uses `experimentalForceLongPolling: true` to bypass WebSocket drops in restricted corporate networks and sandboxed iframes.
* **Listener Cleanup Protocol**: Explicit unsubscriber tracking array executes on auth state shifts, preventing stale query memory leaks and permission-denied console spam.
* **Virtual Image Decoding**: Album art assets leverage async decoding with error fallbacks to localized SVG placeholders.
* **Audio Element Pooling**: Single global `<audio>` singleton reused across tracks to conserve mobile browser memory footprints.

---

## 📂 Directory Structure

```text
vibra/
├── src/
│   ├── components/            # Reusable UI widgets
│   │   ├── AdminLoginsModal.tsx     # Confidential admin audit viewer
│   │   ├── CreateCassetteModal.tsx  # Retro tape customizer
│   │   ├── FullScreenPlayer.tsx     # Immersive visualizer & lyrics
│   │   ├── GlobalPlayer.tsx         # Bottom dock audio controller
│   │   └── InstagramAvatarCustomizer.tsx # Vector avatar studio
│   ├── context/
│   │   └── PlayerContext.tsx        # Global audio pipeline & DB listener
│   ├── lib/
│   │   ├── firebase.ts              # Firebase SDK initialization & error handles
│   │   ├── loginAudit.ts            # Audit log recorder & admin queries
│   │   ├── songLyrics.ts            # High-precision synchronized lyrics DB
│   │   └── songImage.ts             # Smart CDN art resolver
│   ├── tabs/
│   │   ├── GenerateMusicTab.tsx     # Google Lyria AI composer
│   │   ├── CassetteTab.tsx          # Vintage mixtape collection
│   │   ├── LibraryTab.tsx           # Playlists, history & liked tracks
│   │   ├── ProfileTab.tsx           # User settings, avatar & admin hub
│   │   └── SearchTab.tsx            # Multi-channel music search
│   ├── App.tsx                      # Root application scaffold
│   └── main.tsx                     # React DOM entry point
├── firestore.rules                  # Fortress security rules
├── firebase-blueprint.json          # Firestore schema intermediate representation
└── package.json
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
