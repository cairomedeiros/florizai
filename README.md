# FlorizAI

A plant-focused mobile application built with Expo and React Native.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your phone (iOS/Android)

## Installation

```bash
npm install
```

## Run the Application

```bash
npm start
```

Then:
- Scan the QR code with Expo Go (Android) or Camera app (iOS)
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser

## Features

- Authentication flow (ready for Supabase integration)
- Dark/Light theme with plant-inspired colors
- Global state management with Context API
- Protected routes with Expo Router
- Persistent storage with AsyncStorage

## Project Structure

```
app/
  ├── (auth)/          # Protected routes
  │   └── home.tsx     # Main home screen
  ├── _layout.tsx      # Root layout with providers
  ├── index.tsx        # Entry point
  └── login.tsx        # Login screen
contexts/
  ├── AuthContext.tsx  # Authentication state
  └── ThemeContext.tsx # Theme state
```

## Development Mode

Authentication is currently disabled for easier development. Navigate freely between screens.