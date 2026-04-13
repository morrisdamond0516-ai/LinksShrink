# replit.md

## Overview

LinksShrink.com is a URL shortening web application with a React frontend and Express backend. It allows users to shorten long URLs, track visit counts, and offers a premium tier with Stripe integration. The platform provides a comprehensive suite of marketing tools, including retargeting, UTM tracking, A/B testing, geo-routing, and customizable link-in-bio pages. The project aims to provide a robust and feature-rich link management solution for businesses and individuals, enhancing their marketing efforts and providing detailed analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build**: esbuild for production bundling
- **Development**: tsx for direct TypeScript execution

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Migrations**: `drizzle-kit push`

### Authentication
- **Method**: Custom Email/Password Authentication
- **Security**: bcrypt with 12 salt rounds for password hashing
- **Session Management**: express-session with PostgreSQL store and httpOnly cookies

### Payment & Product Delivery Architecture
- **Dual Verification System**: Ensures product delivery through client-side session verification and Stripe webhook events (idempotent to prevent double-granting).
- **Feature Purchase Consumption**: Individual feature purchases are consumed via a `requireEntitlement` middleware.
- **Stripe Integration**: Uses Stripe Managed Payments with tax code `txcd_10103001` (SaaS - business use).

### Core Features
- **URL Shortening**: Generates ultra-short Base62 encoded URLs.
- **Analytics**: Tracks visit counts and comprehensive funnel analytics for user journeys and conversions.
- **Premium Features**:
    - **Link-in-Bio Pages**: Customizable landing pages with themes, social links, and shop functionality.
    - **Retargeting Pixels**: Integration with Facebook, Google, TikTok for audience building.
    - **UTM Builder**: Automatic UTM parameter appending.
    - **Geo-Routing**: Redirects based on user's country.
    - **Team Workspaces**: Role-Based Access Control (RBAC) for collaborative link management.
    - **Conversion Tracking**: Tracks conversions and revenue.
    - **Link Scheduling & Limits**: Control activation times and maximum clicks.
    - **A/B Testing**: Split traffic between different URLs.
    - **Mobile Deep Links**: Routes mobile users to app-specific URLs.
    - **AI Video Ad Creator**: Integrates with HeyGen for AI-generated video advertisements.
- **Individual Feature Purchases**: Allows users to purchase specific features or credits.

### Redirect Handler Logic
- A robust redirect handler manages scheduled activations, deactivations, click limits, password protection, analytics tracking, and applies UTM parameters, geo-routing, A/B testing, mobile deep linking, and retargeting pixels before the final redirect.

### Compliance
- **Microsoft Advertising Compliance**: Includes a cookie consent banner, consent-gated retargeting, and updated privacy policy/terms of service to address GDPR, CCPA, and third-party tracking disclosures.

## External Dependencies

- **Database**: PostgreSQL
- **Payment Gateway**: Stripe
- **Email Service**: Resend (sends from no-reply@linksshrink.com via Replit integration)
- **AI Video Generation**: HeyGen API
- **UI Components**: shadcn/ui, Radix UI, Lucide React, react-icons
- **Build Tools**: Vite, esbuild
- **Fonts**: Google Fonts (Inter, Outfit)