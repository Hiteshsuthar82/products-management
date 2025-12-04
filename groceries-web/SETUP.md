# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd groceries-web
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the `groceries-web` directory:
   ```env
   VITE_API_BASE_URL=https://groceries.itfuturz.in/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

## Troubleshooting

### Service Worker Errors / Failed to Fetch

If you see errors like:
- "Failed to fetch"
- "service-worker.js" errors
- "GET http://localhost:5173/@vite/client net::ERR_FAILED"

**Solutions:**

1. **Clear Service Workers in Browser:**
   - Open DevTools (F12)
   - Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
   - Click **Service Workers** in the left sidebar
   - Click **Unregister** for any registered service workers
   - Go to **Clear storage** and click **Clear site data**

2. **Or use Browser Console:**
   ```javascript
   // Paste this in browser console (F12)
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   caches.keys().then(function(names) {
     for (let name of names) caches.delete(name);
   });
   ```
   Then hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

3. **Clear Browser Cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

4. **Restart Dev Server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### MIME Type Error

If you see the error: "Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'text/html'"

**Solutions:**

1. **Make sure Vite dev server is running:**
   ```bash
   npm run dev
   ```
   Don't open the HTML file directly in the browser. Always use the dev server URL.

2. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely

3. **Check if dependencies are installed:**
   ```bash
   npm install
   ```

4. **Verify the dev server is running on the correct port:**
   - Check the terminal output for the local URL
   - Usually: `http://localhost:3000` or `http://localhost:5173`

5. **If using a different server (like serving from backend):**
   - Make sure the server is configured to serve JavaScript files with correct MIME types
   - For production, use `npm run build` and serve the `dist` folder

### Common Issues

- **Empty page**: Make sure you're accessing via the Vite dev server, not opening `index.html` directly
- **Module not found**: Run `npm install` to install all dependencies
- **Port already in use**: Change the port in `vite.config.ts` or kill the process using the port

