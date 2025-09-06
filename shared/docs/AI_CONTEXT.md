# Shared Architecture Guide

## Overview

This document outlines the architectural patterns and organization strategy for the shared folder, which contains reusable code between different parts of the application (frontend, backend, functions, etc.).

## Core Principles

### 1. Separation of Concerns

- **Business Logic** vs **UI Logic**: Keep them separate and well-defined
- **Shared** vs **Local**: Only move to shared when truly reusable across projects
- **Domain Boundaries**: Respect module boundaries and avoid circular dependencies

### 2. Scalability First

- **Module-based organization**: Organize by business domains/modules
- **Sub-module support**: Allow for nested organization within modules
- **Future-proof structure**: Support for micro-frontends, API versioning, and code generation

### 3. Developer Experience

- **Clear naming conventions**: Consistent and descriptive names
- **Explicit imports**: Avoid broad imports that hurt tree-shaking
- **Type safety**: Strong TypeScript typing throughout

## Folder Structure

```
shared/
├── docs/                    # Documentation and guidelines
├── types/                   # TypeScript type definitions
│   ├── common/             # Cross-module types (API, validation, etc.)
│   └── [module]/           # Module-specific types
│       ├── [sub-module]/   # Sub-module types (optional)
│       └── index.ts        # Module exports
├── enums/                  # Enumeration definitions
│   ├── common/             # Cross-module enums
│   └── [module]/           # Module-specific enums
├── consts/                 # Constants and configuration
│   ├── api/                # API endpoints and configs
│   ├── modules/            # Module-specific constants
│   └── validation/         # Validation schemas and rules
├── models/                 # Business logic models and interfaces
│   └── [module]/           # Module-specific business models
└── utils/                  # Utility functions
    ├── common/             # Cross-module utilities
    └── [module]/           # Module-specific utilities
```

## What Goes Where

### Types (`/types`)

**Include:** Data structures, interfaces, type unions that are shared between frontend and backend
**Exclude:** Component props, UI-specific types, local component state types

```typescript
// ✅ Include - Shared business types
export interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ❌ Exclude - Component props (keep local)
export interface UserDialogProps {
  open: boolean;
  onClose: () => void;
}
```

### Models (`/models`)

**Include:** Business logic interfaces, domain models, entity definitions
**Exclude:** UI models, component state

```typescript
// ✅ Include - Business domain model
export interface IPortfolio {
  id: string;
  userId: string;
  // ... business properties
}
```

### Constants (`/consts`)

**Include:** API endpoints, business rules, configuration values
**Exclude:** Component-specific defaults, UI constants

```typescript
// ✅ Include - Business constants
export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
} as const;

// ❌ Exclude - UI constants (keep local)
export const DIALOG_WIDTH = 600;
```

### Enums (`/enums`)

**Include:** Business domain enums, status codes, types
**Exclude:** UI-specific enums, component states

```typescript
// ✅ Include - Business enum
export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// ❌ Exclude - UI enum (keep local)
export enum DialogSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg',
}
```

### Utils (`/utils`)

**Include:** Pure functions, business logic helpers, data transformations
**Exclude:** UI helpers, component utilities

```typescript
// ✅ Include - Business logic utility
export function calculatePortfolioValue(holdings: Holding[]): number {
  return holdings.reduce((sum, holding) => sum + holding.value, 0);
}

// ❌ Exclude - UI utility (keep local)
export function formatDialogTitle(title: string): string {
  return `${title} - Dialog`;
}
```

## Naming Conventions

- **Types**: PascalCase (`TransactionFormData`, `AssetType`)
- **Interfaces**: Prefix business models with `I` (`IPortfolio`, `ITransaction`)
- **Enums**: PascalCase for enum, SCREAMING_SNAKE_CASE for values
- **Constants**: SCREAMING_SNAKE_CASE (`TRANSACTION_LIMITS`, `API_ENDPOINTS`)
- **Files**: kebab-case for folders, camelCase for files

## Import Strategy

```typescript
// ✅ Recommended - Specific module imports
import {
  Asset,
  TransactionFormData,
} from '@shared/types/[module]/[sub-module]';
import { TRANSACTION_LIMITS } from '@shared/consts/modules/[module]';

// ⚠️ Acceptable - Module level imports
import { Asset } from '@shared/types/[module]';

// ❌ Avoid - Root level imports (hurts tree-shaking)
import { Asset } from '@shared/types';
```

## Module Organization

### Adding New Modules

1. **Identify the domain**: What business area does this belong to?
2. **Create folder structure**: Follow the established pattern
3. **Add index exports**: Ensure proper export hierarchy
4. **Document the module**: Add to this guide if it introduces new patterns

### Adding New Types

1. **Determine scope**: Is this truly shared or component-specific?
2. **Choose location**: Business logic (`models/`) or data structure (`types/`)?
3. **Follow naming**: Use established conventions
4. **Update exports**: Add to appropriate index files

## Migration Guidelines

When moving existing code to shared:

### ✅ Move These

- Business domain types and interfaces
- API request/response types
- Constants used in business logic
- Utility functions for data processing
- Enums for business states/types

### ❌ Keep Local

- Component props interfaces
- UI state types
- Component-specific constants
- UI utility functions
- Local component enums

### Migration Checklist

- [ ] Is this used by both frontend and backend?
- [ ] Is this business logic rather than UI logic?
- [ ] Does this have clear module boundaries?
- [ ] Are the imports updated across the codebase?
- [ ] Are the exports added to index files?

## Best Practices

1. **Start specific, generalize later**: Begin with local types, move to shared when truly needed
2. **Respect boundaries**: Don't create dependencies between unrelated modules
3. **Document decisions**: Update this guide when introducing new patterns
4. **Review regularly**: Ensure the structure still serves the project's needs
5. **Type everything**: Use strict TypeScript for better developer experience

## Future Considerations

- **API Versioning**: Structure supports versioned API types
- **Micro-frontends**: Modules can be extracted into separate applications
- **Code Generation**: Types can be generated from schemas or APIs
- **Package Distribution**: Modules can be distributed as separate npm packages
