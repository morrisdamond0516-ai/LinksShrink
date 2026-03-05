# replit.md

## Overview

This is LinksShrink.com, a URL shortener web application built with a React frontend and Express backend. Users can submit long URLs and receive shortened versions that redirect to the original destination. The app tracks visit counts for each shortened URL and includes a premium tier system with Stripe payment integration. Features a comprehensive suite of marketing tools including retargeting, UTM tracking, A/B testing, geo-routing, and link-in-bio pages.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (March 2026)

### 10 New Premium Features Added
1. **Link-in-Bio Pages**: Customizable landing pages with themes (default, ocean, sunset, forest, purple, minimal), social links, and shop functionality. Public pages at /b/:slug
2. **Retargeting Pixels**: Add Facebook, Google, TikTok tracking pixels to links for audience building
3. **UTM Builder**: Auto-append UTM parameters (source, medium, campaign, term, content) to destination URLs
4. **Link-in-Bio Shop**: Sell digital products from bio pages with product management
5. **Geo-Routing**: Route visitors to different URLs based on country detection via Accept-Language headers
6. **Team Workspaces**: Create workspaces, invite members with roles (owner/admin/member), RBAC-enforced role hierarchy (only owners can assign/remove admins, owners cannot be removed)
7. **Conversion Tracking**: Track conversions and revenue per link via API endpoint
8. **Link Scheduling**: Schedule links to activate at future dates
9. **A/B Testing**: Split traffic between two URLs with configurable percentage
10. **Click Limits**: Set max clicks before link auto-deactivates

### New Database Tables
- `bio_pages` - Link-in-bio pages with themes, links (jsonb), socialLinks (jsonb)
- `bio_page_products` - Digital products for bio page shops
- `team_workspaces` - Team/workspace management
- `workspace_members` - Team membership with roles
- `conversion_events` - Conversion tracking events with revenue

### New URL Columns
- `retargetingPixels` (text) - JSON string with facebook/google/tiktok pixel IDs
- `utmSource/utmMedium/utmCampaign/utmTerm/utmContent` (text) - UTM parameters
- `geoRoutes` (jsonb) - Country code to URL mapping for geo-routing
- `abTestUrl` (text) + `abTestSplit` (integer) - A/B test configuration
- `maxClicks` (integer) - Maximum clicks before deactivation
- `scheduledAt` (timestamp) - Scheduled activation time
- `deactivatedAt` (timestamp) - When link was deactivated

### New Frontend Pages
- `/features/bio` - BioPageBuilder.tsx - Link-in-bio page builder
- `/features/utm` - UTMBuilder.tsx - UTM parameter builder
- `/features/retargeting` - RetargetingPixels.tsx - Retargeting pixel setup
- `/features/scheduling` - LinkScheduling.tsx - Link scheduling
- `/features/click-limits` - ClickLimits.tsx - Click limits
- `/features/ab-testing` - ABTesting.tsx - A/B testing
- `/features/geo-routing` - GeoRouting.tsx - Geo-targeting
- `/features/teams` - Teams.tsx - Team management
- `/features/conversions` - ConversionTracking.tsx - Conversion tracking
- `/b/:slug` - Public bio page rendering (server-side HTML)

### New API Endpoints
- Bio Pages: `POST /api/bio/create`, `GET /api/bio/my-pages`, `GET /api/bio/:slug`, `PATCH /api/bio/:id`, `DELETE /api/bio/:id`
- Bio Products: `POST /api/bio/:id/products`, `DELETE /api/bio/products/:productId`
- Teams: `POST /api/teams/create`, `GET /api/teams/my-teams`, `POST /api/teams/:id/invite`, `DELETE /api/teams/:id/members/:userId`
- Conversions: `POST /api/conversions/track`, `GET /api/conversions/:urlId`

### Updated Individual Feature Purchases
- **Starter**: Click Analytics ($5), QR Code ($3), Custom Slug ($2), UTM Builder ($3), Link Scheduling ($3), Click Limit ($2), Bio Page ($10)
- **Pro**: Advanced Analytics ($8), Expiring Link ($3), Password Protection ($3), Retargeting Pixel ($5), A/B Test ($5), Geo Routing ($5), Conversion Tracking ($8)
- **Enterprise**: Bulk Links 100 ($10), API Access 24hr ($15)

## Authentication

### Custom Email/Password Authentication
- **Registration**: Users create accounts with email, password, first name, last name
- **Password Security**: bcrypt with 12 salt rounds, stored as passwordHash
- **Session Management**: express-session with PostgreSQL store, httpOnly cookies
- **Login/Register Pages**: Client-side forms at /login and /register routes

### Authentication Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/user` - Get authenticated user info

### Key Auth Files
- `server/auth.ts` - Password hashing, registerUser, loginUser functions
- `server/replit_integrations/auth/replitAuth.ts` - Passport-local strategy, session setup
- `client/src/pages/Login.tsx`, `client/src/pages/Register.tsx`
- `client/src/hooks/use-auth.ts` - Auth hook for frontend

## Payment & Credits

### Stripe Payment Integration
- **Payment Flow**: Users purchase plans via Stripe Checkout
- **Server-side Verification**: Payments verified with Stripe API
- **Entitlement Storage**: Verified payments in PostgreSQL `entitlements` table
- **Webhook**: Configured manually via Stripe Dashboard

### Usage Credit System
- **Free Tier**: 5 links per month (resets monthly)
- **Paid Credits**: $20 for 20 additional link credits (don't expire monthly)
- **Anonymous Tracking**: Usage tracked via persistent localStorage anon_token + IP hash
- **Idempotent Verification**: Purchases verified idempotently

### Automated Refund System
- Refund form at /refund, automated eligibility checking via Stripe
- Email notifications via Yahoo SMTP (YAHOO_APP_PASSWORD)
- Contact: ProductionLinks@yahoo.com

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build**: esbuild for production bundling
- **Development**: tsx for running TypeScript directly

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Managed via `drizzle-kit push`

### Redirect Handler Logic (GET /:shortCode)
1. Check scheduled activation (scheduledAt)
2. Check deactivation status (deactivatedAt)
3. Check click limit (maxClicks vs visitCount)
4. Check expiry (expiresAt)
5. Check password protection
6. Record analytics (premium URLs)
7. Increment visit count
8. Apply UTM parameters to destination URL
9. Apply geo-routing (country-based redirect)
10. Apply A/B testing (traffic split)
11. Inject retargeting pixels (render HTML with delayed redirect)
12. Final redirect

### Short Code Generation (Ultra-Short)
Base62 encoding (0-9, a-z, A-Z) from database ID. Shortest possible codes guaranteed.

## External Dependencies

### Database
- PostgreSQL via DATABASE_URL environment variable
- connect-pg-simple for session storage

### UI Component Library
- shadcn/ui, Radix UI, Lucide React, react-icons

### Build & Development
- Vite, esbuild, Replit Plugins

### Fonts
- Google Fonts: Inter (body), Outfit (display)
