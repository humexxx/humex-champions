Firebase Functions – Modular Architecture Guide

Last Updated: 2025-09-05
Version: 2.0 - Modular Architecture with Submodule Support
Scope: Organize by domain modules with hierarchical submodules, separate by trigger type (callables / PubSub / schedulers), keep business logic reusable, and isolate 3rd-party integrations.

Where this document lives (standard)

Location: docs/architecture/firebase-functions.md

If this repo only holds Functions, you may also surface a link from ARCHITECTURE.md at the root.

Core Principles

1. **Domain First**: Each module owns its business logic (\*.service.ts), validation, and endpoints (callables / PubSub / schedulers).

2. **Hierarchical Organization**: Large domains can be split into submodules for better organization and maintainability.

3. **Thin Handlers**: Handlers only authorize, validate, and delegate to services - no business logic in HTTP/trigger handlers.

4. **Reusable Core**: Initialization, auth, config, error mapping, logging live in core/ - shared across all modules.

5. **Vendor Isolation**: Every third-party integration has a dedicated client (SDK/HTTP) + service (use-cases) in services/.

6. **External Models**: Models/DTOs must be defined externally (shared package/workspace) or imported from @shared/ - never define models inside handlers.

7. **Scalable Structure**: Each module/submodule follows consistent patterns for easy expansion and maintenance.

Folder Structure (TypeScript) - Generic Pattern

```
functions/
├─ package.json
├─ tsconfig.json
├─ eslintrc.cjs
└─ src/
   ├─ index.ts                     # Re-export modules so Firebase picks them up
   │
   ├─ core/                        # Cross-cutting concerns (no module deps)
   │  ├─ firebase.ts               # adminApp singleton, db, auth
   │  ├─ auth.ts                   # requireAuth, requireAdmin helpers
   │  ├─ logger.ts                 # logging utility / correlation ids
   │  ├─ errors.ts                 # AppError ↔ HttpsError mapping
   │  ├─ validation.ts             # zod helpers (parseOrThrow)
   │  └─ config.ts                 # env, regions, timeouts, feature flags
   │
   ├─ services/                    # Third-party integrations (isolated)
   │  ├─ [domain]/
   │  │  ├─ [provider].ts          # Provider client (e.g., polygon.ts)
   │  │  ├─ [provider]Cache.ts     # Cache service (optional)
   │  │  ├─ [provider].service.ts  # Business logic for provider
   │  │  └─ types.ts               # Provider-specific types
   │  └─ [another-domain]/
   │     ├─ [client].ts
   │     └─ service.ts
   │
   └─ modules/                     # Domain modules (one folder per domain)
      ├─ [simple-module]/          # Simple module pattern
      │  ├─ index.ts               # Module exports
      │  ├─ [module].service.ts    # Business logic
      │  ├─ [module].validators.ts # Zod schemas
      │  ├─ http/                  # HTTP callable functions
      │  │  └─ [function].callable.ts
      │  ├─ schedulers/            # Scheduled functions (optional)
      │  │  └─ [function].scheduler.ts
      │  └─ pubsub/                # PubSub triggers (optional)
      │     └─ [function].pubsub.ts
      │
      └─ [complex-module]/         # Complex module with submodules
         ├─ index.ts               # Main module exports
         ├─ [module].validators.ts # Shared validators for all submodules
         ├─ [module].service.ts    # Shared business logic (optional)
         │
         ├─ [submodule-1]/         # First submodule
         │  ├─ index.ts            # Submodule exports
         │  ├─ [submodule].service.ts
         │  ├─ http/
         │  │  ├─ [function1].callable.ts
         │  │  └─ [function2].callable.ts
         │  └─ schedulers/
         │     └─ [scheduler].scheduler.ts
         │
         ├─ [submodule-2]/         # Second submodule
         │  ├─ index.ts
         │  ├─ [submodule].service.ts
         │  ├─ http/
         │  │  ├─ [function3].callable.ts
         │  │  └─ [function4].callable.ts
         │  └─ schedulers/
         │     └─ [scheduler].scheduler.ts
         │
         └─ [nested-parent]/       # Nested submodule parent
            ├─ index.ts            # Parent exports
            │
            ├─ [nested-child-1]/   # Deep nesting example
            │  ├─ index.ts
            │  ├─ [child].service.ts
            │  ├─ http/
            │  │  └─ [function].callable.ts
            │  └─ schedulers/
            │     └─ [scheduler].scheduler.ts
            │
            └─ [nested-child-2]/
               ├─ index.ts
               ├─ [child].service.ts
               └─ http/
                  └─ [function].callable.ts
```

Current Implementation Example:

```
modules/
├─ admin/                         # Simple module
│  ├─ index.ts
│  ├─ admin.service.ts
│  ├─ admin.validators.ts
│  └─ http/
│     └─ addAdminClaim.callable.ts
│
├─ auth/                          # Trigger-only module
│  ├─ index.ts
│  └─ triggers.ts
│
├─ entertainment/                 # Complex module with deep submodules
│  ├─ index.ts
│  ├─ entertainment.validators.ts
│  └─ sports/                     # Parent submodule
│     ├─ index.ts
│     ├─ f1/                      # Child submodule
│     │  ├─ index.ts
│     │  ├─ f1.service.ts
│     │  ├─ http/ (8 callables)
│     │  └─ schedulers/ (3 schedulers)
│     └─ soccer/                  # Child submodule
│        ├─ index.ts
│        ├─ soccer.service.ts
│        ├─ http/ (9 callables)
│        └─ schedulers/ (2 schedulers)
│
├─ finances/                      # Complex module with multiple submodules
│  ├─ index.ts
│  ├─ finances.validators.ts
│  ├─ finances.service.ts
│  ├─ http/ (shared functions)
│  ├─ schedulers/ (shared schedulers)
│  ├─ pubsub/ (shared triggers)
│  ├─ portafolio/                 # Portfolio submodule
│  │  ├─ index.ts
│  │  ├─ portafolio.service.ts
│  │  └─ http/ (2 callables)
│  └─ personalFinances/           # Personal finance submodule
│     ├─ index.ts
│     ├─ personalFinances.service.ts
│     └─ http/ (2 callables)
│
└─ uplift/                        # Simple module
   ├─ index.ts
   ├─ uplift.service.ts
   ├─ validators.ts
   └─ handlers.ts
```

Module Architecture Patterns

## Simple Module Pattern

Use for domains with few functions and straightforward logic.

Structure:

```
[module]/
├─ index.ts                    # Exports all functions
├─ [module].service.ts         # Business logic
├─ [module].validators.ts      # Zod validation schemas
├─ http/                       # HTTP callable functions
│  └─ [function].callable.ts
├─ schedulers/                 # Scheduled functions (optional)
│  └─ [function].scheduler.ts
└─ pubsub/                     # PubSub triggers (optional)
   └─ [function].pubsub.ts
```

Examples: admin, auth, uplift

## Complex Module Pattern

Use for large domains that benefit from logical subdivision.

Structure:

```
[module]/
├─ index.ts                    # Re-exports from all submodules
├─ [module].validators.ts      # Shared validation schemas
├─ [module].service.ts         # Shared business logic (optional)
│
├─ [submodule-1]/              # Domain subdivision
│  ├─ index.ts                 # Submodule exports
│  ├─ [submodule].service.ts   # Submodule business logic
│  ├─ http/
│  │  └─ [function].callable.ts
│  └─ schedulers/
│     └─ [function].scheduler.ts
│
└─ [submodule-2]/              # Another subdivision
   ├─ index.ts
   ├─ [submodule].service.ts
   └─ http/
      └─ [function].callable.ts
```

Examples: entertainment (with sports/f1, sports/soccer), finances (with portafolio, personalFinances)

## Deep Nesting Pattern

Use when submodules themselves need further organization.

Structure:

```
[module]/
├─ index.ts
├─ [module].validators.ts
│
└─ [parent-submodule]/         # Parent grouping
   ├─ index.ts                 # Re-exports from children
   │
   ├─ [child-1]/               # First child domain
   │  ├─ index.ts
   │  ├─ [child].service.ts
   │  └─ http/
   │     └─ [function].callable.ts
   │
   └─ [child-2]/               # Second child domain
      ├─ index.ts
      ├─ [child].service.ts
      └─ http/
         └─ [function].callable.ts
```

Example: entertainment/sports/ (parent) with f1/ and soccer/ (children)

File Naming Conventions

## Function Files

- `*.callable.ts` → HTTP callable functions (onCall handlers)
- `*.scheduler.ts` → Scheduled functions (onSchedule handlers)
- `*.pubsub.ts` → PubSub triggers (onMessagePublished handlers)
- `*.trigger.ts` → Other Firebase triggers (auth, database, storage)

## Service Files

- `*.service.ts` → Pure business logic (no firebase-admin, no vendor SDKs)
- `*.validators.ts` → Zod validation schemas (domain-specific, not in core/)
- `*.types.ts` → TypeScript type definitions (when needed locally)

## Barrel Files

- `index.ts` → Re-exports for module/submodule organization

## Configuration Files

- `config.ts` → Environment variables, runtime settings
- `firebase.ts` → Firebase admin initialization
- `auth.ts` → Authentication helpers

Expansion Guidelines

## Adding a New Simple Module

1. **Create module directory**: `src/modules/[new-module]/`

2. **Create core files**:

   ```
   [new-module]/
   ├─ index.ts                    # Export barrel
   ├─ [new-module].service.ts     # Business logic
   ├─ [new-module].validators.ts  # Validation schemas
   └─ http/                       # Function handlers
      └─ [function].callable.ts
   ```

3. **Implement service layer**: Pure business logic, no Firebase dependencies

4. **Add validators**: Zod schemas for input validation

5. **Create handlers**: Thin wrappers that auth, validate, and delegate

6. **Export in main index**: Add to `src/index.ts`

## Adding a New Complex Module

1. **Create module structure**:

   ```
   [new-module]/
   ├─ index.ts                    # Main exports
   ├─ [module].validators.ts      # Shared schemas
   ├─ [submodule-1]/
   │  ├─ index.ts
   │  ├─ [submodule].service.ts
   │  └─ http/
   └─ [submodule-2]/
      ├─ index.ts
      ├─ [submodule].service.ts
      └─ http/
   ```

2. **Plan submodule boundaries**: Group related functionality logically

3. **Share common validators**: Put shared schemas at parent level

4. **Implement barrel exports**: Each level exports its children

## Adding Functions to Existing Modules

1. **Identify target module/submodule**: Find the appropriate domain

2. **Add service method**: Pure business logic in `*.service.ts`

3. **Add validator** (if needed): New schema in `*.validators.ts`

4. **Create handler**: New `*.callable.ts` in appropriate `http/` folder

5. **Update exports**: Add to relevant `index.ts` files

## Adding Third-Party Integrations

1. **Create service directory**: `src/services/[domain]/`

2. **Implement client**: `[provider].ts` with SDK/HTTP client

3. **Add service layer**: `[provider].service.ts` with use-cases

4. **Define types**: `types.ts` for provider-specific models

5. **Add caching** (optional): `[provider]Cache.ts` for performance

## Migration Strategy

When restructuring existing modules:

1. **Plan new structure**: Decide on module/submodule boundaries

2. **Create new structure**: Build new folders and files

3. **Move business logic**: Transfer service methods

4. **Update imports**: Fix all import paths

5. **Test thoroughly**: Ensure all functions work

6. **Clean up**: Remove old files and unused code

## Core Implementation Templates

### Single Initialization & Config

**src/core/firebase.ts**

```typescript
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;
export function adminApp(): App {
  if (!app) app = getApps()[0] ?? initializeApp();
  return app;
}

export const db = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());
```

**src/core/config.ts**

```typescript
export const runtime = {
  region: 'us-central1',
  memoryMiB: 512,
  timeoutSeconds: 60,
};

export const env = {
  STRIPE_KEY: process.env.STRIPE_KEY ?? '',
  POLYGON_API_KEY: process.env.POLYGON_API_KEY ?? '',
  F1_API_KEY: process.env.F1_API_KEY ?? '',
};

export const flags = {
  enableVendors: true,
  enableCaching: true,
};
```

### Authorization Helpers

**src/core/auth.ts**

```typescript
import { HttpsError } from 'firebase-functions/v2/https';

export function requireAuth(ctx: { auth?: { uid: string } }): string {
  const uid = ctx.auth?.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Auth required');
  return uid;
}

export function requireAdmin(ctx: { auth?: { token?: any } }): void {
  const isAdmin = ctx.auth?.token?.admin === true;
  if (!isAdmin) throw new HttpsError('permission-denied', 'Admin only');
}
```

### Validation Helpers

**src/core/validation.ts**

```typescript
import { ZodSchema } from 'zod';
import { HttpsError } from 'firebase-functions/v2/https';

export const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const r = schema.safeParse(data);
  if (!r.success) throw new HttpsError('invalid-argument', r.error.message);
  return r.data;
};
```

## Module Templates

### Validator Template

**src/modules/[module]/[module].validators.ts**

```typescript
import { z } from 'zod';

// Example input schema
export const CreateItemInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type CreateItemInput = z.infer<typeof CreateItemInput>;

// Example query schema
export const GetItemsQuery = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  category: z.string().optional(),
});

export type GetItemsQuery = z.infer<typeof GetItemsQuery>;
```

### Service Template

**src/modules/[module]/[module].service.ts**

```typescript
import { db } from '../../../../core/firebase';
// Import types from shared workspace (external)
import type { ItemInput, ItemSummary } from '@shared/types/[module]';

export async function createItem(uid: string, input: ItemInput) {
  const ref = db().collection('users').doc(uid).collection('items').doc();
  await ref.set({
    ...input,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'active',
  });
  return { id: ref.id };
}

export async function getItems(
  uid: string,
  options: GetItemsQuery
): Promise<ItemSummary[]> {
  const query = db()
    .collection('users')
    .doc(uid)
    .collection('items')
    .limit(options.limit)
    .offset(options.offset);

  if (options.category) {
    query.where('category', '==', options.category);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ItemSummary[];
}

export async function updateItem(
  uid: string,
  itemId: string,
  updates: Partial<ItemInput>
) {
  const ref = db().collection('users').doc(uid).collection('items').doc(itemId);
  await ref.update({
    ...updates,
    updatedAt: Date.now(),
  });
  return { success: true };
}
```

### Callable Handler Template

**src/modules/[module]/http/[function].callable.ts**

```typescript
import { onCall } from 'firebase-functions/v2/https';
import { runtime } from '../../../../core/config';
import { requireAuth } from '../../../../core/auth';
import { parseOrThrow } from '../../../../core/validation';
import { CreateItemInput } from '../[module].validators';
import { createItem } from '../[module].service';

export const createItemCallable = onCall(
  {
    region: runtime.region,
    timeoutSeconds: runtime.timeoutSeconds,
    memory: runtime.memoryMiB,
  },
  async (req) => {
    const uid = requireAuth(req);
    const input = parseOrThrow(CreateItemInput, req.data);
    return await createItem(uid, input);
  }
);
```

### Scheduler Template

**src/modules/[module]/schedulers/[function].scheduler.ts**

```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { runtime } from '../../../../core/config';
import { logger } from '../../../../core/logger';
import { processScheduledTask } from '../[module].service';

export const processItemsScheduler = onSchedule(
  {
    schedule: 'every 24 hours',
    timeZone: 'America/New_York',
    region: runtime.region,
  },
  async (event) => {
    logger.info('Starting scheduled item processing', {
      timestamp: event.scheduleTime,
    });

    try {
      const result = await processScheduledTask();
      logger.info('Scheduled processing completed', { result });
    } catch (error) {
      logger.error('Scheduled processing failed', { error });
      throw error;
    }
  }
);
```

### PubSub Template

**src/modules/[module]/pubsub/[function].pubsub.ts**

```typescript
import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { runtime } from '../../../../core/config';
import { logger } from '../../../../core/logger';
import { handleItemEvent } from '../[module].service';

export const onItemEventPubSub = onMessagePublished(
  {
    topic: 'item-events',
    region: runtime.region,
    timeoutSeconds: 120,
  },
  async (event) => {
    const { uid, action, itemId } = event.data.message.json as {
      uid: string;
      action: string;
      itemId: string;
    };

    logger.info('Processing item event', { uid, action, itemId });

    await handleItemEvent(uid, action, itemId);
  }
);
```

### Barrel Export Template

**src/modules/[module]/index.ts**

```typescript
// Simple module exports
export { createItemCallable } from './http/createItem.callable';
export { getItemsCallable } from './http/getItems.callable';
export { updateItemCallable } from './http/updateItem.callable';
export { processItemsScheduler } from './schedulers/processItems.scheduler';
export { onItemEventPubSub } from './pubsub/onItemEvent.pubsub';
```

**src/modules/[complex-module]/index.ts**

```typescript
// Complex module with submodules - re-export everything
export * from './[submodule-1]';
export * from './[submodule-2]';
export * from './[parent-submodule]';

// Optional: export shared utilities
export { validateInput } from './[module].validators';
export { commonUtility } from './[module].service';
```

## Third-Party Integration Templates

### Service Client Template

**src/services/[domain]/[provider].ts**

```typescript
import { env, flags } from '../../core/config';
import { logger } from '../../core/logger';

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

class ProviderClient {
  private config: ProviderConfig;

  constructor() {
    this.config = {
      apiKey: env.PROVIDER_API_KEY,
      baseUrl: 'https://api.provider.com/v1',
      timeout: 30000,
    };
  }

  async getData(params: GetDataParams): Promise<ProviderResponse> {
    if (!flags.enableVendors) {
      throw new Error('Provider integration disabled');
    }

    const url = `${this.config.baseUrl}/data`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      logger.error('Provider API error', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Provider API error: ${response.status}`);
    }

    return response.json();
  }
}

export const providerClient = new ProviderClient();
```

### Service Layer Template

**src/services/[domain]/[provider].service.ts**

```typescript
import { providerClient } from './[provider]';
import { logger } from '../../core/logger';
import type { ProcessedData, RawProviderData } from './types';

export async function getProcessedData(query: string): Promise<ProcessedData> {
  try {
    const rawData = await providerClient.getData({ query });

    // Transform external data to internal format
    const processedData: ProcessedData = {
      id: rawData.external_id,
      name: rawData.display_name,
      value: rawData.current_value,
      timestamp: Date.now(),
      source: 'provider',
    };

    logger.info('Data processed successfully', { query, resultCount: 1 });
    return processedData;
  } catch (error) {
    logger.error('Failed to process data', { query, error });
    throw new Error('Data processing failed');
  }
}

export async function batchProcessData(
  queries: string[]
): Promise<ProcessedData[]> {
  const results = await Promise.allSettled(
    queries.map((query) => getProcessedData(query))
  );

  const successful = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<ProcessedData>).value);

  const failed = results.filter(
    (result) => result.status === 'rejected'
  ).length;

  logger.info('Batch processing completed', {
    total: queries.length,
    successful: successful.length,
    failed,
  });

  return successful;
}
```

## Best Practices Summary

### DO ✅

- **Keep handlers thin** - Only auth, validate, delegate
- **Use external types** - Import from @shared/ workspace
- **Implement proper error handling** - Map to HttpsError appropriately
- **Add comprehensive logging** - Include correlation IDs and context
- **Follow naming conventions** - Consistent file and function naming
- **Group by domain** - Logical module boundaries
- **Use barrel exports** - Clean import paths
- **Validate at edges** - Zod schemas for all inputs
- **Isolate vendors** - Separate client and service layers
- **Document complex modules** - Clear README for each major module

### DON'T ❌

- **Mix business logic in handlers** - Keep Firebase-specific code minimal
- **Define models in functions** - Always use external shared types
- **Couple modules together** - Each module should be independent
- **Skip validation** - Always validate inputs with Zod
- **Hardcode configuration** - Use config.ts and environment variables
- **Ignore error handling** - Proper error mapping is crucial
- **Create deep nesting without reason** - Only nest when it adds clarity
- **Mix trigger types** - Separate http/, schedulers/, pubsub/ clearly
- **Skip logging** - Comprehensive logging is essential for debugging
- **Bypass authentication** - Always check auth where required

This architecture provides a scalable, maintainable foundation that can grow with your application needs while maintaining clean separation of concerns and consistent patterns across all modules.
