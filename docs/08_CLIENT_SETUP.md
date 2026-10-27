# Task 08: Client Setup

## 1. Overview
The frontend client for **IMovies** is built using **React 18** and bundled with **Vite** for high developer velocity and optimized production builds.

## 2. Dependencies

### Core Dependencies
- `react` & `react-dom` (v18.3.1): Foundation for component-based user interface.
- `react-router-dom` (v6.27.0): Client-side routing with nested, protected, and admin-only routes.
- `axios` (v1.7.7): Promise-based HTTP client for API communication.
- `react-toastify` (v10.0.6): Lightweight notifications for instant visual feedback.
- `socket.io-client` (v4.8.0): Real-time seat updates synchronization.
- `bootstrap` (v5.3.3) & `bootstrap-icons` (v1.11.3): Responsive layout grids and cinema icons.

### Development Dependencies
- `vite` (v5.4.9): Next-generation frontend build tool.
- `@vitejs/plugin-react` (v4.3.3): Fast Babel-based JSX transform and Fast Refresh.

## 3. Configuration Files

### `client/vite.config.js`
Configured with an API reverse proxy pointing to `http://localhost:5000` to prevent cross-origin issues during local development:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

### `client/.env.example`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 4. Running the Client
```bash
# Navigate to client directory
cd client

# Install packages
npm install

# Run development server
npm run dev
```
The client starts locally at: **http://localhost:5173**
