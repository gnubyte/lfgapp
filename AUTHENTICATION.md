# Authentication System

This React Native app includes a complete authentication system that integrates with the LFG (Looking for Group) API at `lookingforgroup.cloud`.

## Features

- **Secure Login**: Username/password authentication
- **Token Management**: Automatic JWT token storage and refresh
- **Persistent Sessions**: Remembers login state across app restarts
- **Auto-logout**: Handles token expiration gracefully
- **Loading States**: Smooth user experience during authentication
- **Error Handling**: User-friendly error messages

## Architecture

### 1. AuthContext (`contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides login/logout functions
- Handles token storage and retrieval
- Auto-refreshes expired tokens

### 2. API Service (`services/api.ts`)
- Centralized API communication
- Automatic token attachment to requests
- Token refresh on 401 responses
- Error handling and retry logic

### 3. Login Screen (`app/login.tsx`)
- Beautiful, gaming-themed UI
- Form validation
- Loading states
- Error handling

### 4. Protected Routes
- Automatic redirect to login when not authenticated
- Dashboard and profile screens show user data
- Logout functionality throughout the app

## API Integration

The app integrates with the following LFG API endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh access token

## Usage

### Login
```typescript
const { login } = useAuth();
const success = await login(username, password);
```

### Register
```typescript
const { register } = useAuth();
const success = await register({
  username: 'gamer123',
  email: 'gamer@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe'
});
```

### Logout
```typescript
const { logout } = useAuth();
await logout();
```

### Check Auth State
```typescript
const { isAuthenticated, user, isLoading } = useAuth();
```

## Security Features

- **Secure Storage**: Tokens stored in AsyncStorage (encrypted on device)
- **Token Refresh**: Automatic refresh before expiration
- **Request Interceptors**: Automatic token attachment
- **Error Handling**: Graceful handling of network errors

## File Structure

```
contexts/
├── AuthContext.tsx          # Authentication context and state management

services/
├── api.ts                   # API service with token management

app/
├── login.tsx               # Login screen
├── register.tsx            # Registration screen
├── (tabs)/
│   ├── dashboard.tsx       # Authenticated dashboard
│   ├── profile.tsx         # User profile with logout
│   └── timeline.tsx        # Timeline screen with user info
└── _layout.tsx             # Root layout with auth routing
```

## Authentication Flow

1. **App Launch**: Check for stored tokens
2. **Token Validation**: Verify tokens with API
3. **Auto-refresh**: Refresh tokens if needed
4. **Login Required**: Redirect to login if no valid tokens
5. **Authenticated**: Show main app with user data

## Error Handling

- Network errors show user-friendly messages
- Invalid credentials display appropriate alerts
- Token refresh failures trigger logout
- Loading states prevent multiple requests

## Customization

### API Base URL
Update the `API_BASE_URL` in `services/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api-domain.com/api';
```

### Token Storage Keys
Modify storage keys in `contexts/AuthContext.tsx`:
```typescript
const TOKEN_KEY = 'your_app_auth_tokens';
const USER_KEY = 'your_app_user';
```

### UI Theming
The login screen uses the app's existing theming system and can be customized by modifying the styles in `app/login.tsx`.

## Testing

To test the authentication system:

1. **Valid Login**: Use real credentials from your LFG API
2. **Invalid Login**: Try wrong credentials to see error handling
3. **Token Refresh**: Let tokens expire to test auto-refresh
4. **App Restart**: Close and reopen app to test persistence
5. **Logout**: Test logout functionality

## Dependencies

- `@react-native-async-storage/async-storage` - Secure token storage
- `axios` - HTTP client with interceptors
- `expo-router` - Navigation and routing
- `react-native` - Core React Native components

This authentication system provides a solid foundation for your LFG gaming app with secure, persistent user sessions and a great user experience!
