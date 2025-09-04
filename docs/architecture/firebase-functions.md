Firebase Functions – Modular Architecture Guide

Last Updated: 2025-09-03
Scope: Organize by domain modules, separate by trigger type (callables / PubSub / schedulers), keep business logic reusable, and isolate 3rd-party integrations.

Where this document lives (standard)

Location: docs/architecture/firebase-functions.md

If this repo only holds Functions, you may also surface a link from ARCHITECTURE.md at the root.

Core Principles

Domain first: each module owns its business logic (\*.service.ts), validation, and endpoints (callables / PubSub).

Thin handlers: handlers only authorize, validate, and delegate to services.

Reusable core: initialization, auth, config, error mapping, logging live in core/.

Vendors isolated: every third-party integration has a client (SDK/HTTP) + service (use-cases).

Models/DTOs: must be defined externally (shared package/workspace) or imported from @shared/.

In this project, shared lives completely outside of functions/ (e.g., a sibling workspace). Do not define models inside handlers.

Folder Structure (TypeScript)
functions/
├─ package.json
├─ tsconfig.json
├─ eslintrc.cjs
└─ src/
├─ index.ts # Re-export modules so Firebase picks them up
│
├─ core/ # Cross-cutting concerns (no module deps)
│ ├─ firebase.ts # adminApp singleton, db, auth
│ ├─ auth.ts # requireAuth, requireAdmin
│ ├─ logger.ts # logging utility / correlation ids
│ ├─ errors.ts # AppError ↔ HttpsError mapping
│ ├─ validation.ts # zod helpers (parseOrThrow)
│ └─ config.ts # env, regions, timeouts, feature flags
│
├─ vendors/ # Third-party integrations (isolated)
│ ├─ stripe/
│ │ ├─ client.ts # configured Stripe/axios instance
│ │ └─ service.ts # vendor-specific use-cases
│ └─ sendgrid/
│ ├─ client.ts
│ └─ service.ts
│
└─ modules/ # One folder per domain
├─ finances/
│ ├─ index.ts
│ ├─ finance.service.ts # pure business logic (no Firebase SDK here)
│ ├─ finance.validators.ts # zod schemas (inputs at the boundary)
│ ├─ http/ # Callables/HTTP handlers
│ │ ├─ createGoal.callable.ts
│ │ └─ getSummary.callable.ts
│ ├─ pubsub/ # Pub/Sub handlers
│ │ ├─ onTxCreated.pubsub.ts
│ │ └─ recalcDaily.pubsub.ts
│ └─ schedulers/ # (optional) Cloud Scheduler (via Pub/Sub)
│ └─ nightlyRecalc.scheduler.ts
│
└─ health/
├─ index.ts
├─ health.service.ts
├─ http/
└─ pubsub/

Naming conventions

\*.callable.ts → onCall handlers

\*.pubsub.ts → onMessagePublished / onSchedule handlers

\*.service.ts → business logic only (no firebase-admin, no vendor SDKs)

\*.validators.ts → zod schemas near the domain (not in core/)

Single Initialization & Config

src/core/firebase.ts

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

src/core/config.ts

export const runtime = {
region: 'us-central1',
memoryMiB: 512,
timeoutSeconds: 60,
};

export const env = {
STRIPE_KEY: process.env.STRIPE_KEY ?? '',
};

export const flags = {
enableVendors: true,
};

Authorization Helpers

src/core/auth.ts

import { HttpsError } from 'firebase-functions/v2/https';

export function requireAuth(ctx: { auth?: { uid: string } }): string {
const uid = ctx.auth?.uid;
if (!uid) throw new HttpsError('unauthenticated', 'Auth required');
return uid;
}

export function requireAdmin(ctx: { auth?: { token?: any } }): void {
const isAdmin = ctx.auth?.token?.admin === true; // or check a role store
if (!isAdmin) throw new HttpsError('permission-denied', 'Admin only');
}

Validation at the Edges

src/core/validation.ts

import { ZodSchema } from 'zod';
import { HttpsError } from 'firebase-functions/v2/https';

export const parseOrThrow = <T>(schema: ZodSchema<T>, data: unknown): T => {
const r = schema.safeParse(data);
if (!r.success) throw new HttpsError('invalid-argument', r.error.message);
return r.data;
};

src/modules/finances/finance.validators.ts

import { z } from 'zod';

export const CreateGoalInput = z.object({
name: z.string().min(1),
target: z.number().positive(),
currency: z.string().length(3),
});

export type CreateGoalInput = z.infer<typeof CreateGoalInput>;

Business Logic (Pure)

src/modules/finances/finance.service.ts

import { db } from '@/core/firebase';
// Models/DTOs come from external shared workspace:
import type { GoalInput } from '@shared/types/finance'; // <-- outside /functions

export async function createGoal(uid: string, input: GoalInput) {
const ref = db().collection('users').doc(uid).collection('goals').doc();
await ref.set({ ...input, createdAt: Date.now() });
return { id: ref.id };
}

export async function getMonthlySummary(uid: string) {
// aggregation example
return { month: '2025-09', total: 1234.56 };
}

Callables (Thin Handlers)

src/modules/finances/http/createGoal.callable.ts

import { onCall } from 'firebase-functions/v2/https';
import { runtime } from '@/core/config';
import { requireAuth } from '@/core/auth';
import { parseOrThrow } from '@/core/validation';
import { CreateGoalInput } from '../finance.validators';
import { createGoal } from '../finance.service';

export const createGoalCallable = onCall(
{ region: runtime.region, timeoutSeconds: runtime.timeoutSeconds },
async (req) => {
const uid = requireAuth(req);
const input = parseOrThrow(CreateGoalInput, req.data);
return await createGoal(uid, input);
}
);

Pub/Sub (Reuse the same Service Layer)

src/modules/finances/pubsub/onTxCreated.pubsub.ts

import { onMessagePublished } from 'firebase-functions/v2/pubsub';
import { runtime } from '@/core/config';
import { getMonthlySummary } from '../finance.service';

export const onTxCreated = onMessagePublished(
{ topic: 'tx-created', region: runtime.region, timeoutSeconds: 120 },
async (event) => {
const { uid } = event.data.message.json as { uid: string };
await getMonthlySummary(uid);
}
);

Third-Party Integrations

src/vendors/stripe/client.ts

import Stripe from 'stripe';
import { env } from '@/core/config';

export const stripe = new Stripe(env.STRIPE_KEY, { apiVersion: '2024-06-20' });

src/vendors/stripe/service.ts

import { stripe } from './client';

export async function createPaymentIntent(amount: number, currency: string) {
return stripe.paymentIntents.create({ amount, currency });
}

From domain services (e.g., finance.service.ts), inject or import only the vendor service functions you need—keep domain free from SDK specifics to ease testing and swapping providers.

Barrel Files & Root Export

src/modules/finances/index.ts

export { createGoalCallable } from './http/createGoal.callable';
export { onTxCreated } from './pubsub/onTxCreated.pubsub';

src/index.ts

export _ as finances from './modules/finances';
export _ as health from './modules/health';

This namespacing typically yields deployed functions like finances-createGoalCallable, finances-onTxCreated, etc.
