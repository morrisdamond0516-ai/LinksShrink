# LinkShrink Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Stripe's premium feel, Linear's sharp typography, and Vercel's tech-forward aesthetic. The dark theme with lime/yellow creates a cyberpunk-meets-professional vibe that screams modern SaaS.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts) - crisp, modern, excellent at small sizes
- **Accent Font**: Space Grotesk for headings - geometric, tech-forward
- **Hierarchy**: 
  - Hero: 4xl-6xl bold (Space Grotesk)
  - Section Headers: 3xl-4xl semibold
  - Body: base-lg regular (Inter)
  - Metrics/Stats: 2xl-3xl bold with tabular-nums

### Layout System
**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 (p-4, gap-8, py-20, etc.)
- Sections: py-20 to py-32 desktop, py-12 mobile
- Component spacing: gap-8 to gap-12 between major elements
- Max container width: max-w-7xl

### Color Application
- **Background**: Black (#000000) base
- **Lime-400 (#a3e635)**: Primary CTAs, active states, key metrics, success states
- **Yellow-400 (#facc15)**: Secondary accents, "Unlock" badges, premium indicators, hover states
- **Neutrals**: Zinc-900/800/700 for cards/borders, Zinc-400 for secondary text
- **Glass Effects**: bg-zinc-900/50 with backdrop-blur-xl for elevated cards

## Component Library

### Hero Section (Full viewport with image)
- **Layout**: Asymmetric split - text left (40%), visual right (60%)
- **Image**: Abstract tech visualization - flowing lines/nodes representing link connections, neon lime/yellow glow effects on dark backdrop
- **CTA Buttons**: Primary (lime-400 bg), Secondary (border lime-400 with blurred black background when over image)
- **Trust Indicators**: "100M+ links shortened" badge in yellow-400 glow

### URL Shortener Input (Featured Component)
- **Card**: Zinc-900 bg with lime-400/20 border, subtle shadow
- **Input Field**: Large (h-16), black bg, white text, lime-400 focus ring
- **Shorten Button**: Lime-400 with black text, full height inline with input
- **Result Display**: Animated slide-down with copy button (yellow-400 on hover)

### Feature Cards with Unlock System
- **Grid**: 3 columns desktop (grid-cols-3), stack mobile
- **Free Tier Cards**: Zinc-800 bg, standard height
- **Premium Cards**: Zinc-900 bg with yellow-400 border glow, "PRO" badge in top-right
- **Unlock CTA**: Yellow-400 button with lock icon, positioned at card bottom
- **Icons**: Heroicons outline style in lime-400

### Pricing Section
- **Cards**: 2-column comparison (Free vs Pro)
- **Free**: Zinc-800 with white text
- **Pro (Recommended)**: Black with lime-400 gradient border, elevated with glow effect
- **Payment Button**: Lime-400 bg, includes Stripe badge for trust
- **Feature Lists**: Checkmarks in lime-400, strikethroughs for unavailable features

### Stats/Social Proof
- **Layout**: 4-column grid of metrics
- **Numbers**: Huge (text-5xl), lime-400 or yellow-400 alternating
- **Labels**: Zinc-400, uppercase tracking-wide

### Footer
- **Style**: Zinc-900 bg, border-top zinc-800
- **Content**: 4 columns - Product, Company, Resources, Newsletter signup
- **Newsletter Input**: Similar to hero input but compact, yellow-400 accent
- **Social Icons**: Zinc-400 with lime-400 hover

## Images Required

1. **Hero Image**: Abstract digital network visualization
   - Style: Dark with glowing lime/yellow nodes and connecting lines
   - Mood: Futuristic, fast, interconnected
   - Placement: Right 60% of hero, bleeds to edge
   - Format: High-res PNG/WebP with transparency for blending

2. **Feature Illustrations** (3 total):
   - Link analytics dashboard mockup (dark UI with lime charts)
   - QR code generation preview
   - Custom branded link visualization
   - Placement: Top of respective feature cards
   - Style: UI screenshots with lime/yellow accent highlights

## Animations (Minimal)
- Input focus: Smooth lime-400 ring expansion
- Button hovers: Subtle lift (translateY-1) + brightness increase
- Card hovers: Gentle border glow intensification
- Unlock button: Pulsing yellow glow animation (slow, 3s cycle)

## Critical Implementation Notes
- Maintain sharp contrast: lime/yellow text on black only, never on zinc
- Use backdrop-blur for buttons over images (bg-black/80 backdrop-blur-md)
- Premium feel requires generous whitespace - don't crowd elements
- All interactive elements need visible focus states (lime-400 rings)
- Trust signals throughout: security badges, company logos, testimonial avatars