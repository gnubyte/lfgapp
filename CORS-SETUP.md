# CORS Setup for Development

This app includes a CORS proxy server to handle cross-origin requests during development.

## The Problem

When developing locally, the React Native app runs on `http://localhost:8081` (web) or `http://localhost:19006` (Expo), but the API server runs on `http://localhost:5000`. This creates a CORS (Cross-Origin Resource Sharing) issue where the browser blocks requests between different origins.

## The Solution

We've set up a CORS proxy server that:
1. Runs on `http://localhost:3001`
2. Accepts requests from the React Native app
3. Proxies them to the API server at `http://localhost:5000`
4. Adds proper CORS headers to allow cross-origin requests

## How to Use

### Option 1: Run Both Servers (Recommended)
```bash
npm run dev
```
This will start both the CORS proxy server and the Expo development server.

### Option 2: Run Servers Separately
```bash
# Terminal 1: Start CORS proxy
npm run proxy

# Terminal 2: Start Expo app
npm start
```

## Configuration

The API service automatically detects if you're in development mode and uses the proxy:

```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001/api'  // Use CORS proxy in development
  : 'http://localhost:5000/api'; // Direct connection in production
```

## What the Proxy Does

1. **Accepts requests** from `http://localhost:8081` and `http://localhost:19006`
2. **Adds CORS headers** to allow cross-origin requests
3. **Proxies requests** to `http://localhost:5000/api`
4. **Forwards responses** back to the React Native app
5. **Logs requests** for debugging

## Troubleshooting

### If you see CORS errors:
1. Make sure the proxy server is running (`npm run proxy`)
2. Check that the API server is running on port 5000
3. Verify the proxy server logs show requests being forwarded

### If authentication fails:
1. Check that tokens are being stored properly
2. Verify the API server is returning valid JWT tokens
3. Check the proxy server logs for any errors

## Production

In production, the app will connect directly to the API server without the proxy, so CORS needs to be configured on the API server itself.

## Files

- `proxy-server.js` - CORS proxy server
- `services/api.ts` - API service with proxy configuration
- `package.json` - Scripts to run the proxy
