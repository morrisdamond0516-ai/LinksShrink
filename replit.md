# replit.md

## Overview

This is LinkShrink, a URL shortener web application built with a React frontend and Express backend. Users can submit long URLs and receive shortened versions that redirect to the original destination. The app tracks visit counts for each shortened URL and includes a premium tier system with Stripe payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

### Stripe Payment Integration
- **Payment Flow**: Users can purchase premium plans via Stripe Checkout
- **Server-side Verification**: Payments are verified with Stripe API before unlocking features
- **Entitlement Storage**: Verified payments stored in PostgreSQL `entitlements` table
- **Protected APIs**: Premium endpoints require valid entitlement to access

### Key Files Added/Modified
- `server/stripeClient.ts` - Stripe client using Replit connector API
- `server/webhookHandlers.ts` - Webhook processing for Stripe events
- `server/entitlements.ts` - Database-backed entitlement storage and validation
- `shared/schema.ts` - Added `entitlements` table schema

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

The frontend follows a pages-based structure under `client/src/pages/` with reusable components in `client/src/components/ui/`. Custom hooks in `client/src/hooks/` handle data fetching and mutations.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build**: esbuild for production bundling with selective dependency bundling
- **Development**: tsx for running TypeScript directly
- **Static Serving**: Serves built frontend from `dist/public` in production

The server uses a clean separation between routes (`server/routes.ts`), database access (`server/db.ts`), and storage logic (`server/storage.ts`).

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Migrations**: Managed via `drizzle-kit push` command
- **Database**: PostgreSQL (requires `DATABASE_URL` environment variable)

The URL schema stores: id, originalUrl, shortCode (unique), visitCount, and createdAt.

### Entitlements Table
Stores verified Stripe payments: id, sessionId (unique), plan, stripeCustomerId, verifiedAt, expiresAt.

### Stripe Integration
- **Package**: `stripe-replit-sync` for managed webhooks and data sync
- **Key Management**: Uses Replit connector API (no hardcoded keys)
- **Webhook Handler**: Registered before express.json() for proper payload handling

### API Design
- **Contract Location**: `shared/routes.ts` - defines API paths, methods, and Zod schemas
- **Validation**: Zod schemas shared between client and server for type-safe validation
- **Endpoints**:
  - `POST /api/shorten` - Create shortened URL
  - `GET /api/urls/:shortCode` - Get URL stats
  - `GET /:shortCode` - Redirect to original URL

### Payment & Entitlement Endpoints
- `GET /api/stripe/publishable-key` - Get Stripe publishable key for frontend
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `GET /api/verify-session/:sessionId` - Verify payment and store entitlement
- `GET /api/check-entitlement/:sessionId` - Check if session has valid entitlement
- `GET /api/premium/analytics` - Protected analytics endpoint (requires entitlement)
- `GET /api/premium/qr` - Protected QR feature endpoint (requires entitlement)

### Short Code Generation
Short codes start at 1 character and progressively increase length as collisions occur. This optimizes for shorter URLs while ensuring uniqueness.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage (configured but not actively used for auth)

### UI Component Library
- **shadcn/ui**: Pre-built accessible components using Radix UI primitives
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner

### Fonts
- Google Fonts: Inter (body), Outfit (display)