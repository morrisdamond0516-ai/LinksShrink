# replit.md

## Overview

This is LinksShrink.com, a URL shortener web application built with a React frontend and Express backend. Users can submit long URLs and receive shortened versions that redirect to the original destination. The app tracks visit counts for each shortened URL and includes a premium tier system with Stripe payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2026)

### Stripe Payment Integration
- **Payment Flow**: Users can purchase premium plans via Stripe Checkout
- **Server-side Verification**: Payments are verified with Stripe API before unlocking features
- **Entitlement Storage**: Verified payments stored in PostgreSQL `entitlements` table
- **Protected APIs**: Premium endpoints require valid entitlement to access

### Usage Credit System (NEW)
- **Free Tier**: 5 links per month for all users (resets monthly)
- **Paid Credits**: $20 for 20 additional link credits (don't expire monthly)
- **Anonymous Tracking**: Usage tracked via IP hash for users without accounts
- **UI Display**: Shows remaining credits on homepage with "Buy More" CTA
- **Idempotent Verification**: Link pack purchases are verified idempotently to prevent duplicate grants
- **Credit Consumption**: Credits consumed only after successful URL creation

### Credit System Tables
- `usage_credits` - Tracks free/paid credits per user or anonymous token per month
- `processed_link_packs` - Ensures link pack purchases are only processed once

### Credit Endpoints
- `GET /api/credits` - Get remaining credits (free + paid)
- `POST /api/create-link-pack-checkout` - Create Stripe checkout for $20/20 links (no auth required)

### Premium Features (Fully Functional)
- **Smart QR Codes**: Custom color QR code generation with high-res PNG download (2000px)
- **Advanced Analytics**: Real-time click tracking, device/browser breakdown, referrer analysis, clicks over time
- **Password Protection**: Secure links with SHA-256 hashed passwords, custom password prompt page
- **Expiring Links**: Time-limited URLs with automatic deactivation and custom expired page
- **Bulk Shortener**: Up to 100 URLs per batch with CSV export
- **Branded Links**: Custom slugs (3-50 chars) for memorable, branded URLs
- **Shorter Codes**: Premium users get 2-4 char codes vs free 4-6 char codes

### Key Files Added/Modified
- `server/stripeClient.ts` - Stripe client using Replit connector API
- `server/webhookHandlers.ts` - Webhook processing for Stripe events
- `server/entitlements.ts` - Database-backed entitlement storage and validation
- `server/storage.ts` - DatabaseStorage with PremiumUrlOptions, analytics tracking, password verification
- `shared/schema.ts` - Added `entitlements`, `urlAnalytics` tables, premium URL fields

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

### Premium Feature Endpoints (all require entitlement)
- `POST /api/premium/qr/generate` - Generate QR code with custom colors
- `GET /api/premium/qr/download` - Download high-res PNG QR code
- `GET /api/premium/analytics/:urlId` - Get detailed analytics for a URL
- `GET /api/premium/my-urls` - Get all URLs for authenticated user
- `POST /api/premium/shorten` - Create premium URL with password/expiry/custom slug
- `POST /api/premium/bulk-shorten` - Bulk create up to 100 URLs
- `PATCH /api/premium/url/:id` - Update URL settings
- `POST /api/verify-password/:shortCode` - Verify password for protected links

### Short Code Generation (Ultra-Short)
Short codes use Base62 encoding (0-9, a-z, A-Z = 62 characters) derived from the URL's database ID. This guarantees the **shortest possible codes**:
- First 62 URLs: 1-character codes (0, 1, 2, ... a, b, c, ... Z)
- Next 3,844 URLs: 2-character codes (10, 11, ... ZZ)
- Next 238,328 URLs: 3-character codes
- And so on...

The system uses atomic transactions to ensure uniqueness and O(1) code generation.

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