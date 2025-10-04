# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Start development server (default - uses .env.development)
npm run dev

# Start development server with production backend
npm run dev:prod

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Check environment configuration
npm run check-env
```

### Testing & Debugging
```bash
# Test navigation system (run in browser console)
node test-navigation.js

# Check environment variables and .env files
node check-env.js
```

### Development Server Details
- **Port**: 5173
- **Host**: 0.0.0.0 (accessible from other devices on network)
- **API Proxy**: `/api` routes are proxied to backend (configurable via VITE_API_BASE_URL)
- **Hot Reload**: Enabled via Vite + React plugin

## Architecture Overview

### Cross-Platform Architecture
This is a **React-based CRM frontend** designed for **85% code reusability** across Web, Mobile (React Native), and Desktop (Electron) platforms.

#### Platform-Independent Core (`src/core/`)
- **Services** (`src/core/services/`): All business logic and API calls
- **Hooks** (`src/core/hooks/`): Reusable React hooks for state management
- **Utils** (`src/core/utils/`): Platform abstraction utilities
- **Config** (`src/core/config/`): Application configuration

#### Platform-Specific Implementation (`src/platforms/`)
- **Web** (`src/platforms/web/`): Current React web application
- **Mobile** (`src/platforms/mobile/`): Future React Native implementation
- **Desktop** (`src/platforms/desktop/`): Future Electron implementation

#### Shared Components (`src/shared/`)
- **Contexts** (`src/shared/contexts/`): React contexts (AuthContext, NotesContext)

### Key Architectural Patterns

#### Service Layer Pattern
All API calls and business logic are centralized in service classes:
```javascript
// Example usage - same code works across all platforms
import { AuthService, UserService, LeadService } from '@/core/services';

const result = await UserService.getUsersByCompany(companyId);
const user = await AuthService.login(credentials);
```

#### Platform Abstraction Layer
Core utilities abstract platform-specific functionality:
```javascript
import { Storage, Navigation, Alert } from '@/core/utils/platform';

// Works on Web (localStorage) and Mobile (AsyncStorage)
await Storage.setItem('user', userData);

// Works on Web (React Router) and Mobile (React Navigation) 
Navigation.navigate('/dashboard');
```

#### Hook-Based State Management
Custom hooks encapsulate complex state logic:
```javascript
import { useAuth, useUsers, useLeads } from '@/core/hooks';

const { user, login, logout } = useAuth();
const { users, loading, updateUser } = useUsers(user.companyId);
```

### Key Services
- **AuthService**: Authentication, OTP, session management
- **UserService**: User CRUD operations
- **LeadService**: Lead management
- **CompanyService**: Company operations
- **PropertyService**: Property management
- **TaskService**: Task management
- **NotificationService**: Notifications

### Key Hooks
- **useAuth**: Authentication state and methods
- **useUsers**: User management with company filtering
- **useLeads**: Lead operations with search/filter
- **useDashboardStats**: Dashboard metrics
- **useProperties**: Property management
- **useTasks**: Task management
- **useNavigationHistory**: Custom navigation history for cancel operations

### Configuration & Environment
- **Vite Configuration**: `vite.config.js` handles proxy setup and path aliases
- **Environment Files**: `.env.development` and `.env.production`
- **Path Alias**: `@/` maps to `./src/`
- **API Proxy**: Configurable backend URL via `VITE_API_BASE_URL`

### Legacy Migration
The `src/legacy/` directory contains old patterns being phased out:
- Legacy API utilities (`src/legacy/api/`)
- Old action patterns (`src/legacy/action/`)
- Deprecated utilities (`src/legacy/utils/`)

When refactoring legacy code, move business logic to `src/core/services/` and UI logic to `src/platforms/web/`.

### Testing Strategy
- Manual navigation testing via `test-navigation.js`
- Environment validation via `check-env.js`
- ESLint for code quality
- No automated test framework currently configured

### Code Style & Quality
- **ESLint**: Configured with React hooks and React refresh plugins
- **Tailwind CSS**: Utility-first styling
- **Module System**: ES6 modules throughout
- **Path Resolution**: Uses Vite path aliases (`@/` for `src/`)

### Development Workflow
1. **Local Development**: Use `npm run dev` with `.env.development`
2. **Production Testing**: Use `npm run dev:prod` to test against production backend
3. **Code Quality**: Run `npm run lint` before committing
4. **Environment Check**: Use `npm run check-env` to verify configuration