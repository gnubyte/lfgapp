# LFG App - Quick Reference 🚀

## 🏃‍♂️ Quick Start

```bash
# First time setup
npm run setup

# Start development
npm run dev:all
```

## 📱 Development Commands

### General
```bash
./build.sh dev          # Start dev server
./build.sh clean        # Clean everything
./build.sh ios          # Build iOS
./build.sh android      # Build Android
```

### iOS Development
```bash
./iosdev.sh dev         # Dev server + iOS simulator
./iosdev.sh simulator   # iOS simulator only
./iosdev.sh device      # Physical iOS device
./iosdev.sh xcode       # Open in Xcode
./iosdev.sh logs        # Show simulator logs
```

### Android Development
```bash
./android.sh dev        # Dev server + Android emulator
./android.sh emulator   # Android emulator only
./android.sh device     # Physical Android device
./android.sh studio     # Open in Android Studio
./android.sh logs       # Show device logs
./android.sh list       # List devices/emulators
```

### Release Builds
```bash
./release.sh ios        # iOS release
./release.sh android    # Android release
./release.sh web        # Web release
./release.sh all        # All platforms
./release.sh eas        # EAS build
./release.sh version    # Update version
```

## 🛠️ NPM Scripts

```bash
npm run setup           # Initial setup
npm run dev:all         # Start dev server
npm run dev:ios         # iOS development
npm run dev:android     # Android development
npm run build:ios       # Build iOS
npm run build:android   # Build Android
npm run build:all       # Build all platforms
npm run clean           # Clean everything
```

## 🔧 Troubleshooting

### Common Issues
```bash
# Metro bundler issues
./build.sh clean

# iOS simulator issues
./iosdev.sh clean && ./iosdev.sh dev

# Android emulator issues
./android.sh clean && ./android.sh dev

# CORS proxy issues
lsof -ti:3001 | xargs kill -9
./build.sh dev
```

### Debug Commands
```bash
./iosdev.sh logs        # iOS logs
./android.sh logs       # Android logs
./release.sh info       # Build info
```

## 📁 Key Files

- `app/` - Expo Router pages
- `components/` - Reusable UI components
- `contexts/` - React contexts (AuthContext)
- `services/` - API and business logic
- `constants/` - Colors and styles
- `build.sh` - General build script
- `iosdev.sh` - iOS development
- `android.sh` - Android development
- `release.sh` - Release builds
- `setup.sh` - Initial setup

## 🌐 API Configuration

- **Development:** `http://localhost:3001/api` (CORS proxy)
- **Production:** `https://lookingforgroup.cloud/api`

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [AUTHENTICATION.md](AUTHENTICATION.md) - Auth system
- [TIMELINE.md](TIMELINE.md) - Timeline feature
- [ROUTING.md](ROUTING.md) - Routing structure
- [CORS-SETUP.md](CORS-SETUP.md) - CORS configuration
