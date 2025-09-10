# Routing Guide

This React Native app uses **Expo Router** for navigation, which provides file-based routing similar to Next.js. This makes it very easy to understand and manage.

## File Structure

```
app/
├── _layout.tsx          # Root layout with Stack navigator
├── (tabs)/              # Tab group (parentheses make it a group, not a route)
│   ├── _layout.tsx      # Tab navigator layout
│   ├── timeline.tsx     # Timeline tab (/)
│   ├── messages.tsx     # Messages tab (/messages)
│   └── profile.tsx      # Profile tab (/profile)
├── settings.tsx         # Settings screen (/settings)
├── modal.tsx            # Modal screen (/modal)
└── +not-found.tsx       # 404 page
```

## Navigation Patterns

### 1. Tab Navigation
- **Location**: `app/(tabs)/_layout.tsx`
- **Screens**: Timeline, Messages, Profile
- **Usage**: Automatically handled by tab bar

### 2. Stack Navigation
- **Location**: `app/_layout.tsx`
- **Screens**: All screens including tabs
- **Usage**: For full-screen navigation

### 3. Modal Presentation
- **Location**: `app/modal.tsx`
- **Usage**: `router.push('/modal')`
- **Behavior**: Slides up from bottom, can be dismissed

### 4. Regular Screen Navigation
- **Location**: `app/settings.tsx`
- **Usage**: `router.push('/settings')`
- **Behavior**: Standard screen transition

## Navigation Methods

```typescript
import { router } from 'expo-router';

// Navigate to a screen
router.push('/settings');

// Navigate to a tab
router.push('/profile');

// Open a modal
router.push('/modal');

// Go back
router.back();

// Replace current screen
router.replace('/home');

// Navigate with parameters
router.push({
  pathname: '/profile',
  params: { userId: '123' }
});
```

## Key Features

- **File-based routing**: File structure determines routes
- **Type-safe navigation**: Full TypeScript support
- **Deep linking**: Automatic URL handling
- **Tab navigation**: Built-in tab bar
- **Modal support**: Native modal presentation
- **Back navigation**: Automatic back button handling
- **Nested layouts**: Support for complex navigation structures

## Adding New Screens

1. **Tab Screen**: Add file to `app/(tabs)/` directory
2. **Regular Screen**: Add file to `app/` directory
3. **Modal Screen**: Add file to `app/` directory with modal presentation
4. **Nested Group**: Create folder with parentheses like `(group)/`

## Examples in This App

- **Timeline** (`/`): Main screen with timeline functionality
- **Messages** (`/messages`): Messages screen with chat functionality
- **Profile** (`/profile`): User profile with navigation examples
- **Settings** (`/settings`): Settings screen with back navigation
- **Modal** (`/modal`): Modal presentation example

This routing setup is perfect for most React Native apps and scales well as your app grows!
