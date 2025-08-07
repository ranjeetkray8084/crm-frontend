# CRM Frontend - Cross-Platform Architecture

A modern CRM frontend built with React, optimized for **Web**, **Mobile**, and **Desktop** applications with maximum code reusability.

## 🎯 **Key Features**

- **85% Code Reusability** across platforms
- **Platform-Independent Services** - Same business logic everywhere
- **Reusable React Hooks** - Works with React and React Native
- **Clean Architecture** - Separation of concerns
- **Future-Proof Structure** - Easy to extend and maintain

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 **Project Structure**

```
src/
├── core/                    # ✅ Platform-Independent (85% reusable)
│   ├── hooks/               # React hooks (Web & Mobile)
│   │   ├── useDashboardStats.js
│   │   ├── useProperties.js
│   │   ├── useCompanies.js
│   │   ├── useAdmins.js
│   │   ├── useUsers.js
│   │   ├── useAuth.js
│   │   ├── useNotifications.js
│   │   ├── useTasks.js
│   │   ├── useNotes.js
│   │   ├── usePropertySearch.js
│   │   ├── useLeads.js
│   │   ├── useLeadSearch.js
│   │   ├── useCompany.js
│   │   ├── useFollowUp.js
│   │   ├── useContact.js
│   │   ├── useApi.js
│   │   ├── useDashboard.js
│   │   └── index.js
│   ├── services/            # Business logic & API calls
│   │   ├── dashboard.service.js
│   │   ├── api.endpoints.js
│   │   ├── company.service.js
│   │   ├── admin.service.js
│   │   ├── auth.service.js
│   │   ├── property.service.js
│   │   ├── task.service.js
│   │   ├── index.js
│   │   ├── note.service.js
│   │   ├── lead.service.js
│   │   ├── user.service.js
│   │   ├── followup.service.js
│   │   ├── notification.service.js
│   │   └── contact.service.js
│   ├── utils/               # Utility functions
│   │   ├── authUtils.js
│   │   ├── platform.js
│   │   ├── alertUtils.js
│   │   └── auth.js
│   ├── config/              # Configuration
│   │   └── index.js
│   └── index.js             # Core exports
│
├── shared/                  # ✅ Shared Components (70% reusable)
│   └── contexts/            # React contexts
│       └── AuthContext.jsx
│
├── platforms/               # ✅ Platform-Specific
│   ├── web/                 # Web application
│   │   ├── pages/
│   │   ├── components/
│   │   └── index.js
│   ├── mobile/              # Mobile app (React Native)
│   │   └── index.js
│   └── desktop/             # Desktop app (Electron)
│       └── index.js
│
└── legacy/                  # ❌ Legacy code (being phased out)
    ├── utils/
    │   └── propertyRoleUtils.js
    ├── api/
    │   ├── axios.js
    │   ├── loadUser.js
    │   ├── loadAdmin.js
    │   ├── leadadd.js
    │   ├── authApi.js
    │   └── accountUtils.js
    └── action/
        ├── updateUser.js
        └── assignAdmin.js
```

## 🔧 **Core Services**

All business logic is centralized in platform-independent services:

```javascript
import { 
  AuthService, 
  UserService, 
  LeadService,
  CompanyService 
} from './core/services';

// Same code works on Web, Mobile, and Desktop
const result = await UserService.getUsersByCompany(companyId);
```

## 🎣 **React Hooks**

Reusable hooks that work across platforms:

```javascript
import { useAuth, useUsers, useLeads } from './core/hooks';

const MyComponent = () => {
  const { user } = useAuth();
  const { users, loading, updateUser } = useUsers(user.companyId);
  const { leads, createLead } = useLeads(user.companyId);
  
  // Same hooks work in React and React Native!
};
```

## 🛠 **Platform Abstraction**

Platform-specific functionality is abstracted:

```javascript
import { Storage, Navigation, Alert } from './core/utils/platform';

// Works on Web (localStorage) and Mobile (AsyncStorage)
await Storage.setItem('user', userData);

// Works on Web (React Router) and Mobile (React Navigation)
Navigation.navigate('/dashboard');

// Works on Web (custom alert) and Mobile (React Native Alert)
Alert.show('Success message');
```

## 📱 **Multi-Platform Development**

### **Web Application (Current)**
- Built with React + Vite
- Uses Tailwind CSS for styling
- Responsive design

### **Mobile Application (Future)**
```bash
# Copy core functionality
cp -r src/core mobile-app/src/
cp -r src/shared mobile-app/src/

# Create React Native components
# Same business logic, different UI
```

### **Desktop Application (Future)**
```bash
# Copy core functionality
cp -r src/core desktop-app/src/
cp -r src/shared desktop-app/src/

# Add Electron-specific features
# Same business logic, enhanced desktop features
```

## 🔄 **Code Reusability Matrix**

| Component | Web | Mobile | Desktop | Reusability |
|-----------|-----|--------|---------|-------------|
| Services  | ✅  | ✅     | ✅      | 100%        |
| Hooks     | ✅  | ✅     | ✅      | 100%        |
| Utils     | ✅  | ✅     | ✅      | 95%         |
| Config    | ✅  | ✅     | ✅      | 90%         |
| Contexts  | ✅  | ✅     | ✅      | 90%         |
| UI Logic  | ✅  | 🔄     | 🔄      | 70%         |
| Components| ❌  | ❌     | ❌      | 0%          |

## 🎯 **Available Scripts**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📚 **Documentation**

- [**Optimized Structure**](./OPTIMIZED_STRUCTURE.md) - Detailed architecture overview
- [**Migration Guide**](./MIGRATION_GUIDE.md) - How to update existing code
- [**API Structure**](./API_STRUCTURE_SUMMARY.md) - Backend integration details
- [**Mobile Reusable Structure**](./MOBILE_REUSABLE_STRUCTURE.md) - Mobile development guide

## 🔧 **Technologies Used**

- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Web routing
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 🚀 **Benefits**

### ✅ **For Developers**
- **Faster Development** - Reuse 85% of code across platforms
- **Consistent Patterns** - Same business logic everywhere
- **Easy Maintenance** - Single source of truth
- **Better Testing** - Test business logic once

### ✅ **For Business**
- **Cost Effective** - Develop multiple platforms faster
- **Consistent UX** - Same behavior across platforms
- **Faster Time to Market** - Leverage existing code
- **Future Proof** - Easy to add new platforms

## 🎯 **Next Steps**

1. **Web Development** - Continue with current structure
2. **Mobile Development** - Copy `core` and `shared` folders
3. **Desktop Development** - Add Electron wrapper
4. **Legacy Cleanup** - Phase out old API patterns

This architecture ensures maximum code reusability while maintaining platform-specific optimizations for the best user experience.