# Production Deployment Guide

## Environment Configuration

### 1. Environment Variables

Create a `.env.production` file in the root directory:

```bash
# Production Environment Variables
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://backend.leadstracker.in
VITE_ENABLE_SECURITY=true
VITE_FORCE_HTTPS=true
VITE_SECURITY_ALERTS=true
```

### 2. Build for Production

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The build files will be in the 'dist' folder
```

### 3. Security Configuration

The application automatically detects the environment and applies appropriate security settings:

#### Localhost (Development)
- Security: Disabled
- HTTPS: Not enforced
- Headers: Minimal
- Sanitization: Disabled

#### Development Server
- Security: Enabled
- HTTPS: Not enforced
- Headers: Standard
- Sanitization: Enabled

#### Production
- Security: Enabled
- HTTPS: Enforced
- Headers: Full security headers
- Sanitization: Enabled

### 4. Deployment Steps

#### Option 1: Static Hosting (Netlify, Vercel, etc.)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your hosting provider

3. **Set environment variables** in your hosting provider's dashboard:
   ```
   VITE_NODE_ENV=production
   VITE_API_BASE_URL=https://backend.leadstracker.in
   VITE_ENABLE_SECURITY=true
   VITE_FORCE_HTTPS=true
   VITE_SECURITY_ALERTS=true
   ```

#### Option 2: Server Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Copy the `dist` folder** to your server

3. **Configure your web server** (Nginx, Apache) to serve the static files

4. **Set up HTTPS** with SSL certificate

5. **Configure environment variables** in your server environment

### 5. Security Features in Production

When deployed to production, the following security features are automatically enabled:

- **HTTPS Enforcement**: Redirects HTTP to HTTPS
- **Security Headers**: Adds security headers to all requests
- **Input Sanitization**: Sanitizes user inputs
- **CORS Protection**: Proper CORS configuration
- **XSS Protection**: Prevents cross-site scripting
- **CSRF Protection**: Prevents cross-site request forgery

### 6. Verification

After deployment, verify that:

1. **HTTPS is working**: Check that the site loads with HTTPS
2. **Security headers are present**: Use browser dev tools to check response headers
3. **Login works**: Test login functionality
4. **Console shows production config**: Check browser console for environment logs

### 7. Troubleshooting

#### If login doesn't work in production:

1. **Check environment variables** are set correctly
2. **Verify API base URL** is correct
3. **Check CORS configuration** on backend
4. **Verify HTTPS certificate** is valid
5. **Check browser console** for errors

#### If security features cause issues:

1. **Temporarily disable security** by setting `VITE_ENABLE_SECURITY=false`
2. **Check specific security feature** causing the issue
3. **Update security configuration** as needed

### 8. Environment Detection

The application automatically detects the environment:

```javascript
// Localhost detection
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// Environment detection
const isDevelopment = import.meta.env.NODE_ENV === 'development';
const isProduction = import.meta.env.NODE_ENV === 'production';
```

### 9. Configuration Override

You can override any configuration by setting environment variables:

```bash
# Disable security (not recommended for production)
VITE_ENABLE_SECURITY=false

# Disable HTTPS enforcement
VITE_FORCE_HTTPS=false

# Disable security alerts
VITE_SECURITY_ALERTS=false
```

## Summary

- **Development**: Security disabled for easy development
- **Production**: Full security enabled automatically
- **Environment variables**: Control security features
- **Automatic detection**: No manual configuration needed
- **Build once, deploy anywhere**: Same build works in all environments
