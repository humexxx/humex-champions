# HumEx Champions - AI Context Documentation

## Tech Stack Overview

**HumEx Champions** is a comprehensive personal development and financial management platform built with modern web technologies:

### Core Technologies

- **React 18**: Modern React with hooks, suspense, and concurrent features
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast build tool and development server
- **Firebase**: Backend-as-a-Service for authentication, database, and cloud functions
- **Material-UI (MUI)**: React component library for consistent design system
- **React Router v6**: Client-side routing with nested routes and lazy loading

### Key Libraries

- **Day.js**: Lightweight date manipulation library (preferred over Moment.js)
- **React Hook Form**: Performant forms with easy validation
- **Yup**: Schema validation for forms and data
- **Firebase v9**: Modular Firebase SDK for auth, Firestore, and functions

### Date Handling Convention

> **Important**: All timestamps in the application are converted to Day.js objects using utility functions. When working with dates, always use `toDayjs()` utility for consistency and `normalizeObjectDates()` for bulk conversions.

## Code Quality Standards

- **Language**: English-only codebase (variables, functions, comments, documentation)
- **Comments**: Minimal and purposeful - only explain complex business logic
- **TypeScript**: Strict typing preferred over comments for documentation
- **Self-documenting**: Use descriptive names that explain intent

---

## Application Architecture

### Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers (Auth, Theme)
├── hooks/              # Custom React hooks
├── layouts/            # Layout components (ClientLayout)
├── pages/              # Page components organized by feature
│   ├── auth/           # Authentication pages
│   ├── portal/         # Protected portal pages
│   │   ├── finances/   # Financial management features
│   │   ├── health/     # Health tracking features
│   │   ├── uplift/     # Personal development features
│   │   └── entertainment/ # Entertainment and sports tracking
├── routes.tsx          # Centralized routing configuration
├── services/           # API service layer
├── utils/              # Utility functions
└── shared/             # Shared models and types
```

---

## Modern Routing Architecture

### Route Configuration System

The application uses a **modern, scalable routing approach** with the following key features:

#### 1. Lazy Loading Implementation

```tsx
// All pages are lazy-loaded for optimal performance
const PortfolioPage = lazy(() =>
  import('./pages/portal/finances').then((module) => ({
    default: module.PortfolioPage,
  }))
);

// Lazy wrapper with consistent loading state
const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<GlobalLoader />}>{children}</Suspense>
);
```

#### 2. Type-Safe Route Configuration

```tsx
interface RouteConfig {
  path: string;
  element: React.ReactElement;
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
  };
}

const financeRoutes: RouteConfig[] = [
  {
    path: ROUTES.PORTAL.FINANCES.PORTFOLIO,
    element: (
      <LazyWrapper>
        <PortfolioPage />
      </LazyWrapper>
    ),
    meta: { title: 'Portfolio - HumEx Champions' },
  },
  // ... more routes
];
```

#### 3. Centralized Route Constants

```tsx
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    SIGN_UP: '/sign-up',
    FORGOT_PASSWORD: '/forgot-password',
  },
  PORTAL: {
    INDEX: '/portal',
    DASHBOARD: '/portal/dashboard',
    FINANCES: {
      INDEX: '/portal/finances',
      PORTFOLIO: '/portal/finances/portfolio',
      PERSONAL_FINANCES: '/portal/finances/personal-finances',
      // ... more finance routes
    },
    // ... other modules
  },
} as const;
```

#### 4. Route Metadata System

```tsx
export const ROUTE_METADATA = {
  [ROUTES.PORTAL.FINANCES.PORTFOLIO]: {
    title: 'Portfolio',
    icon: 'TrendingUp',
    description: 'Investment portfolio management and tracking',
    category: 'finances',
  },
  // ... metadata for all routes
} as const;
```

### Security & Authentication

#### Protected Route Implementation

```tsx
// ClientLayout already wraps all portal routes with PrivateRoute
export default function ClientLayoutWrapper() {
  return (
    <PrivateRoute>
      <ClientLayout />
    </PrivateRoute>
  );
}

// All routes under /portal/* are automatically protected
{
  path: ROUTES.PORTAL.INDEX,
  element: <ClientLayout />, // Contains PrivateRoute wrapper
  children: [
    // All these routes inherit authentication protection
    ...financeRoutes,
    ...healthRoutes,
    ...upliftRoutes,
    ...entertainmentRoutes,
  ],
}
```

### Advanced Route Utilities

#### Custom useRoutes Hook

```tsx
const {
  currentRoute, // Current path
  routeMetadata, // Route metadata
  breadcrumbs, // Auto-generated breadcrumbs
  isFinancesRoute, // Boolean helpers
  navigateToFinances, // Type-safe navigation
} = useRoutes();
```

#### Breadcrumb Navigation Component

```tsx
// Automatic breadcrumb generation
<BreadcrumbNavigation maxItems={4} />
// Generates: Portal > Finances > Portfolio
```

#### Route Validation

```tsx
// Helper functions for route validation
export const isValidRoute = (path: string): boolean => {
  /* ... */
};
export const generateBreadcrumbs = (pathname: string) => {
  /* ... */
};
export const getRouteMetadata = (path: string) => {
  /* ... */
};
```

---

## Key Features & Patterns

### 1. Modular Architecture

- **Feature-based organization**: Each module (finances, health, uplift) is self-contained
- **Shared components**: Reusable UI components across modules
- **Service layer**: Abstracted API calls with Firebase integration

### 2. State Management

- **React Context**: Global state for authentication and theme
- **Custom hooks**: Feature-specific state management
- **Local state**: Component-level state with React hooks

### 3. Form Handling

- **React Hook Form**: Performance-optimized form handling
- **Yup validation**: Schema-based form validation
- **Custom form components**: Reusable form fields with MUI integration

### 4. Firebase Integration

- **Authentication**: Firebase Auth with custom user management
- **Firestore**: NoSQL database with real-time subscriptions
- **Cloud Functions**: Server-side logic for complex operations
- **Storage**: File uploads and media management

### 5. Date Management

- **Day.js convention**: All dates converted to Day.js objects
- **Utility functions**: `toDayjs()`, `normalizeObjectDates()` for consistency
- **Timezone handling**: Consistent date handling across the application

---

## Development Environment

### Platform Configuration

- **Operating System**: Windows
- **Default Shell**: PowerShell v5.1
- **Command Syntax**: Use `;` for joining commands on single line
- **Path Format**: Windows-style paths (e.g., `c:\Users\jahum\code\humex-champions`)

### Development Commands

```powershell
# Build functions
cd .\functions\; npm run build; cd..

# Install dependencies
npm install

# Type checking
npm run type-check

# Linting
npm run lint
```

> **Note**: Testing and development server (`npm run dev`) is handled by the developer. Focus on code implementation and architecture rather than runtime testing.

---

## Development Guidelines

### Code Standards

- **Language**: All code must be written in **English** (variables, functions, comments, documentation)
- **Comments**: Minimal commenting - only add comments for complex business logic or function explanations when necessary
- **Naming**: Use descriptive, self-documenting variable and function names
- **TypeScript**: Leverage strict typing to make code self-explanatory

### Adding New Routes

1. **Define route constant** in `src/consts.ts`
2. **Create lazy-loaded component** import
3. **Add to route configuration** with metadata
4. **Update route metadata** for navigation and SEO
5. **Test navigation** with `useRoutes` hook

### Route Security Best Practices

- ✅ **All portal routes protected** by `ClientLayout` wrapper
- ✅ **Public routes** explicitly defined (auth, landing)
- ✅ **Type-safe navigation** with custom hooks
- ✅ **Error boundaries** for graceful error handling

### Performance Optimizations

- ✅ **Lazy loading** for all page components
- ✅ **Code splitting** by route and feature
- ✅ **Suspense boundaries** with loading states
- ✅ **Route prefetching** for improved UX

### Navigation Patterns

```tsx
// Preferred navigation methods
const { navigateToFinances, navigateToRoute } = useRoutes();

// Type-safe navigation to specific modules
navigateToFinances('PORTFOLIO');

// Generic navigation with route constants
navigateToRoute(ROUTES.PORTAL.HEALTH.NUTRITION);

// Breadcrumb navigation for UX
<BreadcrumbNavigation />;
```

### Component Development

- **English only**: All component names, props, variables, and functions in English
- **Self-documenting code**: Prefer descriptive names over comments
- **Minimal comments**: Only explain complex business logic, not obvious code
- **TypeScript first**: Use types to document interfaces and expected behavior

```tsx
// Good: Self-documenting code
const calculateCompoundInterest = (
  principal: number,
  rate: number,
  years: number
) => {
  return principal * Math.pow(1 + rate, years);
};

// Avoid: Over-commented obvious code
// const calculateCompoundInterest = (principal: number, rate: number, years: number) => {
//   // Calculate compound interest using the formula
//   // principal * (1 + rate)^years
//   return principal * Math.pow(1 + rate, years);
// };
```

---

## Module-Specific Context

### Finances Module

- **Portfolio management**: Investment tracking with real-time data
- **Personal finances**: Income/expense tracking with fixed expenses
- **Trading journal**: Trade logging and analysis
- **System assets**: Internal HumEx investment products with approval workflow

### Health Module

- **Health tracking**: Comprehensive health metrics
- **Nutrition planning**: Meal and diet management
- **Training programs**: Workout and fitness tracking

### Uplift Module

- **Personal development**: Goal setting and progress tracking
- **Analytics**: Performance insights and metrics
- **Planning tools**: Strategic life planning features

### Entertainment Module

- **Sports tracking**: Football, F1, and other sports
- **Travel planning**: Trip organization and tracking
- **Content management**: YouTube and media tracking

---

This architecture provides a **scalable, maintainable, and performant** foundation for the HumEx Champions platform with modern React patterns and Firebase integration.

---

## AI Assistant Integration

### Context Availability

This document serves as the **primary context reference** for all AI interactions with the HumEx Champions codebase. Key points:

- **Architecture patterns**: Follow established routing, state management, and component patterns
- **Code style**: Maintain TypeScript strict typing and modern React patterns
- **Language requirement**: All generated code must be in **English** (variables, functions, comments)
- **Comment policy**: Minimal comments - only for complex business logic explanations
- **Platform awareness**: Windows development environment with PowerShell commands
- **Testing approach**: Focus on implementation; developer handles runtime testing

### Code Generation Rules

1. **English only**: All identifiers, variables, functions, and comments in English
2. **Self-documenting**: Use descriptive names instead of excessive comments
3. **TypeScript strict**: Leverage type system for documentation
4. **Modern patterns**: Use latest React and TypeScript features
5. **Clean code**: Prefer readability over clever solutions

### Quick Reference

- **Main entry**: `src/main.tsx`
- **Routing**: `src/routes.tsx` (centralized configuration)
- **Constants**: `src/consts.ts` (routes, metadata)
- **Hooks**: `src/hooks/useRoutes.ts` (navigation utilities)
- **Layout**: `src/layouts/ClientLayout.tsx` (protected routes wrapper)
- **Components**: `src/components/` (reusable UI components)
