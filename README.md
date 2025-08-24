# Goalsy 🎯

The social habit and goal accountability app! Currently in development! 🚜👷🚧🏗️

## 📁 Project Structure

```
Goalsy/
├── mobile/                 # React Native app (Expo)
│   ├── App.tsx            # Main app component
│   ├── index.tsx          # Entry point
│   ├── app.json           # Expo configuration
│   ├── assets/            # Images, icons, and static files
│   ├── screens/           # Screen components
│   └── package.json       # Mobile dependencies
├── backend/               # Express.js + Firebase backend
│   ├── src/
│   │   ├── app.ts         # Main server file
│   │   ├── config/        # Configuration files
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middleware
│   │   └── types/         # TypeScript type definitions
│   └── package.json       # Backend dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **Expo CLI** - Install globally: `npm install -g @expo/cli`

### For Mobile Development:
- **Xcode** (for iOS development on Mac)
- **Android Studio** (for Android development)
- **Android iOS Emulator** VS Code extension (recommended) - Makes running emulators much easier
- Or use **Expo Go** app on your physical device for quick testing

## 📱 Mobile Frontend Setup

### 1. Navigate to Mobile Directory
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run start
# or
expo start
```

### 4. Run on Specific Platforms
```bash
# iOS (requires Mac with Xcode)
npm run ios

# Android (requires Android Studio/emulator)
npm run android

# Web browser
npm run web
```

## 🖥️ Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory (not included in repo for security):
```env
NODE_ENV=development
PORT=3000
# Add other environment variables as needed
```

### 4. Firebase Configuration
- Place your `firebase-service-account.json` file in the `backend/` directory
- This file should be obtained from your Firebase project console

### 5. Start Development Server
```bash
# Development mode with auto-restart
npm run dev

# Production build
npm run build
npm start
```

The backend server will run on `http://localhost:3000` by default.

## 📱 Mobile Testing Setup

### Option 1: Physical Device (Easiest)
1. Install **Expo Go** from your device's app store
2. Run `expo start` in the mobile directory
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

### Option 2: iOS Simulator (Mac Only)
1. Install **Xcode** from the Mac App Store
2. Open Xcode → Preferences → Components → Install iOS Simulator
3. Run `npm run ios` or press `i` in the Expo CLI

### Option 3: Android Emulator
1. Install **Android Studio**
2. Open Android Studio → More Actions → AVD Manager
3. Create a new Virtual Device:
   - Choose a device (e.g., Pixel 4)
   - Select a system image (e.g., API 30+)
   - Name your AVD and finish setup
4. Start your emulator
5. Run `npm run android` or press `a` in the Expo CLI

#### Setting up Android Studio AVD:
1. Open Android Studio
2. Click "More Actions" → "AVD Manager"
3. Click "Create Virtual Device"
4. Select a device definition (recommended: Pixel 4, Pixel 6)
5. Select a system image (recommended: latest API level available)
6. Click "Next" and then "Finish"
7. Click the play button to start your emulator

#### VS Code Extension for Easier Emulator Management:
Install the **Android iOS Emulator** extension by Diemas Michiels:
1. Open VS Code Extensions (`Ctrl+Shift+X` or `Cmd+Shift+X`)
2. Search for "Android iOS Emulator"
3. Install the extension by Diemas Michiels
4. Configure the Android SDK path in VS Code settings:
   - Open Settings (`Ctrl+,` or `Cmd+,`)
   - Search for "emulator"
   - Set Android SDK path (usually `~/Library/Android/sdk` on Mac or `C:\Users\[username]\AppData\Local\Android\Sdk` on Windows)
5. Use `Ctrl+Shift+P` (or `Cmd+Shift+P`) → "Emulator: Run Android Emulator" to quickly start your emulators

This extension makes it much easier to launch and manage your Android emulators directly from VS Code!

## 🛠️ Development Workflow

### Starting Development
1. Start the backend server: `cd backend && npm run dev`
2. Start the mobile app: `cd mobile && npm start`
3. Open your preferred testing method (device/emulator)

### Making Changes
- Mobile code changes will hot-reload automatically
- Backend changes will auto-restart the server (thanks to ts-node-dev)

## 🧪 Testing

### Mobile Testing
- Use Expo Go on your physical device for quick testing
- Use iOS Simulator or Android Emulator for more comprehensive testing
- Test on both platforms as features may behave differently

### Backend Testing
- API endpoints can be tested using tools like Postman or curl
- Backend logs will appear in your terminal when running `npm run dev`

## 🔧 Common Issues & Solutions

### Mobile Issues
- **Metro bundler issues**: Clear cache with `expo start -c`
- **Dependencies issues**: Delete `node_modules` and run `npm install`
- **Simulator not found**: Ensure Xcode/Android Studio simulators are properly set up

### Backend Issues
- **Port already in use**: Change the PORT in your `.env` file
- **Firebase errors**: Verify your service account JSON file is correctly placed
- **TypeScript errors**: Run `npm run build` to check for compilation issues

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Make your changes and test thoroughly
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Create a Pull Request

## 📞 Need Help?

If you encounter any issues setting up the development environment:
1. Check this README for common solutions
2. Look at the existing code structure for examples
3. Ask a team member for assistance

---

Happy coding! 🚀✨