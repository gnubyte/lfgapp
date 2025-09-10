# LFG - Looking for Group App 🎮

A React Native gaming community platform built with Expo, featuring authentication, timeline feeds, and real-time group management.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Expo CLI** (installed globally or via npx)
- **iOS Development** (macOS only):
  - Xcode (latest version)
  - iOS Simulator
- **Android Development**:
  - Android Studio
  - Android SDK
  - Android Emulator or physical device

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd LFG-app/LFG
   npm install
   ```

2. **Start development:**
   ```bash
   ./build.sh dev
   ```

## 📱 Development Scripts

### General Development

| Command | Description |
|---------|-------------|
| `./build.sh dev` | Start development server with hot reload |
| `./build.sh ios` | Build and run on iOS simulator/device |
| `./build.sh android` | Build and run on Android emulator/device |
| `./build.sh production` | Create production builds for both platforms |
| `./build.sh clean` | Clean all build artifacts and reinstall dependencies |

### iOS Development

| Command | Description |
|---------|-------------|
| `./iosdev.sh dev` | Start dev server and run on iOS simulator |
| `./iosdev.sh simulator` | Run on iOS simulator only |
| `./iosdev.sh device` | Run on physical iOS device |
| `./iosdev.sh build` | Build iOS app for release |
| `./iosdev.sh xcode` | Open iOS project in Xcode |
| `./iosdev.sh clean` | Clean iOS build artifacts |
| `./iosdev.sh logs` | Show iOS simulator logs |

### Android Development

| Command | Description |
|---------|-------------|
| `./android.sh dev` | Start dev server and run on Android emulator |
| `./android.sh emulator` | Run on Android emulator only |
| `./android.sh device` | Run on physical Android device |
| `./android.sh build` | Build Android app for release |
| `./android.sh studio` | Open Android project in Android Studio |
| `./android.sh clean` | Clean Android build artifacts |
| `./android.sh logs` | Show Android device logs |
| `./android.sh install` | Install APK on connected device |
| `./android.sh list` | List connected devices and emulators |

### Release Builds

| Command | Description |
|---------|-------------|
| `./release.sh ios` | Build iOS release |
| `./release.sh android` | Build Android release |
| `./release.sh web` | Build web release |
| `./release.sh standalone` | Create standalone builds for both platforms |
| `./release.sh eas` | Create EAS build (requires EAS CLI) |
| `./release.sh all` | Create all builds (web + standalone) |
| `./release.sh version` | Update app version |
| `./release.sh info` | Show build information |
| `./release.sh clean` | Clean all build artifacts |

## 🛠️ Development Workflow

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Start development server
./build.sh dev
```

### 2. iOS Development

```bash
# Start iOS development
./iosdev.sh dev

# Or run on specific device
./iosdev.sh device

# Open in Xcode for debugging
./iosdev.sh xcode
```

### 3. Android Development

```bash
# Start Android development
./android.sh dev

# Or run on specific device
./android.sh device

# Open in Android Studio
./android.sh studio
```

### 4. Building for Release

```bash
# Build for specific platform
./release.sh ios
./release.sh android

# Or build everything
./release.sh all
```

## 🔧 Configuration

### Environment Setup

1. **iOS Development (macOS only):**
   - Install Xcode from App Store
   - Install Xcode Command Line Tools: `xcode-select --install`
   - Open Xcode and install iOS simulators

2. **Android Development:**
   - Install Android Studio
   - Set up Android SDK
   - Set environment variables:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     ```

### API Configuration

The app uses a CORS proxy for development. The proxy server runs on port 3001 and forwards requests to the main API server.

- **Development API:** `http://localhost:3001/api` (via proxy)
- **Production API:** `https://lookingforgroup.cloud/api`

## 🚀 App Loading Sequence

Understanding how the React Native app initializes and loads its pages is crucial for development. Here's the complete loading sequence:

### 1. **Entry Point** (`package.json`)
```json
"main": "expo-router/entry"
```
- **First file executed:** `expo-router/entry` (Expo's entry point)
- This initializes the Metro bundler and loads the app configuration

### 2. **Root Layout** (`app/_layout.tsx`)
```typescript
export default function RootLayout() {
  // Font loading
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
```
- **Second file loaded:** `app/_layout.tsx` (Root layout)
- Loads custom fonts (SpaceMono)
- Wraps app in `AuthProvider` context
- Renders `RootLayoutNav` component

### 3. **Authentication Context** (`contexts/AuthContext.tsx`)
```typescript
export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    loadStoredAuth(); // Check for stored tokens
  }, []);
}
```
- **Third initialization:** Authentication context
- Checks AsyncStorage for stored JWT tokens
- Sets loading state while checking authentication
- Determines if user is authenticated

### 4. **Navigation Decision** (`app/_layout.tsx` - RootLayoutNav)
```typescript
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />; // Shows spinner
  }
  
  return (
    <Stack initialRouteName={isAuthenticated ? '(tabs)' : 'login'}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      {/* ... other screens */}
    </Stack>
  );
}
```
- **Fourth step:** Navigation routing decision
- If `isLoading = true`: Shows loading spinner
- If `isAuthenticated = true`: Routes to `(tabs)` (authenticated app)
- If `isAuthenticated = false`: Routes to `login` screen

### 5. **Page Loading Based on Authentication**

#### **If User is NOT Authenticated:**
```
app/_layout.tsx → app/login.tsx
```
- **Fifth file:** `app/login.tsx` (Login screen)
- User sees login form
- After successful login → redirects to `(tabs)`

#### **If User IS Authenticated:**
```
app/_layout.tsx → app/(tabs)/_layout.tsx → app/(tabs)/timeline.tsx
```

**Tab Layout** (`app/(tabs)/_layout.tsx`):
```typescript
export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="timeline" />  // Timeline
      <Tabs.Screen name="dashboard" /> // Dashboard  
      <Tabs.Screen name="messages" />  // Messages
      <Tabs.Screen name="profile" />    // Profile
    </Tabs>
  );
}
```

**Default Tab** (`app/(tabs)/timeline.tsx`):
```typescript
export default function TimelineScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadInitialTimeline(); // Load timeline data
    }
  }, [isAuthenticated, authLoading]);
}
```

### 6. **Complete Loading Flow Diagram**

```
App Start
    ↓
expo-router/entry (Metro bundler)
    ↓
app/_layout.tsx (RootLayout)
    ↓
Font Loading (SpaceMono)
    ↓
AuthProvider Context
    ↓
loadStoredAuth() (Check AsyncStorage)
    ↓
RootLayoutNav
    ↓
Authentication Check
    ↓
┌─────────────────┬─────────────────┐
│   NOT AUTHENTICATED              │   AUTHENTICATED
│   ↓                              │   ↓
│   app/login.tsx                  │   app/(tabs)/_layout.tsx
│   (Login Screen)                 │   ↓
│   ↓                              │   app/(tabs)/index.tsx
│   User Login                     │   (Timeline Screen)
│   ↓                              │   ↓
│   Redirect to (tabs)             │   loadInitialTimeline()
│   ↓                              │   ↓
│   app/(tabs)/_layout.tsx         │   Load Timeline Data
│   ↓                              │   ↓
│   app/(tabs)/timeline.tsx        │   Render Timeline
│   (Timeline Screen)              │
└─────────────────┴─────────────────┘
```

### 7. **Key Loading States**

| State | Description | UI Shown |
|-------|-------------|----------|
| `isLoading = true` | Checking authentication | Loading spinner |
| `isLoading = false, isAuthenticated = false` | Not logged in | Login screen |
| `isLoading = false, isAuthenticated = true` | Logged in | Tab navigation |

### 8. **File Loading Order Summary**

1. **`expo-router/entry`** - Metro bundler entry point
2. **`app/_layout.tsx`** - Root layout with font loading
3. **`contexts/AuthContext.tsx`** - Authentication state management
4. **`app/_layout.tsx` (RootLayoutNav)** - Navigation decision
5. **Either:**
   - **`app/login.tsx`** - If not authenticated
   - **`app/(tabs)/_layout.tsx`** - If authenticated
6. **`app/(tabs)/timeline.tsx`** - Default tab (Timeline)

### 9. **Development Notes**

- **Font Loading:** App waits for SpaceMono font to load before rendering
- **Authentication:** Uses AsyncStorage to persist login state
- **Navigation:** Expo Router handles file-based routing automatically
- **State Management:** React Context provides global authentication state
- **Loading States:** Multiple loading states prevent UI flicker during initialization

## 📁 Project Structure

```
LFG/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Registration screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── ThemedCard.tsx    # Themed card component
│   ├── ThemedButton.tsx  # Themed button component
│   └── TimelinePost.tsx  # Timeline post component
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── services/              # API and business logic
│   ├── api.ts            # API service
│   └── timelineCache.ts  # Timeline caching service
├── constants/             # App constants
│   ├── Colors.ts         # Color scheme
│   └── Styles.ts         # Global styles
├── utils/                 # Utility functions
│   └── validation.ts     # Form validation
├── build.sh              # General build script
├── iosdev.sh             # iOS development script
├── android.sh            # Android development script
├── release.sh            # Release build script
└── proxy-server.js       # CORS proxy server
```

## 🎨 Features

- **Authentication System:** JWT-based auth with token refresh
- **Timeline Feed:** Real-time posts with cursor-based pagination
- **Dark Theme:** Consistent dark theme across all screens
- **Responsive Design:** Optimized for iOS and Android
- **Offline Support:** Client-side caching for timeline data
- **Real-time Updates:** Pull-to-refresh and infinite scroll

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   ./build.sh clean
   ```

2. **iOS simulator not starting:**
   ```bash
   ./iosdev.sh clean
   ./iosdev.sh dev
   ```

3. **Android emulator issues:**
   ```bash
   ./android.sh clean
   ./android.sh dev
   ```

4. **CORS proxy not working:**
   ```bash
   # Kill existing proxy and restart
   lsof -ti:3001 | xargs kill -9
   ./build.sh dev
   ```

### Debug Commands

- **iOS logs:** `./iosdev.sh logs`
- **Android logs:** `./android.sh logs`
- **Build info:** `./release.sh info`

## 📚 Documentation

- [Authentication System](AUTHENTICATION.md)
- [Timeline Feature](TIMELINE.md)
- [Routing Structure](ROUTING.md)
- [CORS Setup](CORS-SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both iOS and Android
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
