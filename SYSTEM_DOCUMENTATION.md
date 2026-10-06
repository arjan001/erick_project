# SmartGigs Kenya - System Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Key Technologies](#key-technologies)
4. [Development Setup](#development-setup)
5. [Authentication & Roles](#authentication--roles)
6. [Shop & Auctions](#shop--auctions)
7. [Admin Panel](#admin-panel)
8. [Database Schema](#database-schema)
9. [Environment Variables](#environment-variables)
10. [Build & Deployment](#build--deployment)

## Architecture Overview

SmartGigs Kenya is a React-based frontend application that connects to a remote Base44 backend. The platform is designed for the film and creative industry in Kenya, connecting creators (talent), teams, clients (producers), and backers.

### Current Architecture
- **Frontend**: React with JSX, Vite build tool
- **Backend**: Remote Base44 backend via `@base44/sdk`
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Planned Architecture
- **Frontend**: React with JSX, Vite
- **Backend**: Supabase (PostgreSQL database, Auth, Realtime)
- **API**: Supabase client SDK
- **Payment**: M-Pesa (Daraja API), Card payments (for testing)

## Project Structure

```
src/
├── app/router/           # Route configuration
├── components/          # Reusable components
│   ├── landing/         # Landing page components
│   │   └── backstage/   # Backstage-inspired sections
│   ├── shop/           # Shop-related components
│   └── ui/             # UI components
├── contexts/            # React contexts (Shop, Auth)
├── data/               # Static data (shop products, etc.)
├── layouts/            # Page layouts (Admin, Dashboard, Main)
├── lib/                # Utilities and services
│   ├── AuthContext.jsx # Authentication context
│   └── supabaseEntities.js # Entity definitions
├── modules/            # Feature modules
│   ├── admin/          # Admin panel pages
│   ├── artist/         # Creator pages
│   ├── client/         # Client pages
│   ├── jobs/           # Job management
│   ├── messages/       # Messaging
│   ├── network/        # Network/connections
│   ├── support/        # Support tickets
│   └── team/           # Team pages
├── pages/              # Main pages
├── services/           # API services
│   ├── shopService.js  # Shop functionality
│   └── partnerLogoService.js # Partner management
└── styles/             # Global styles
```

## Key Technologies

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

### Backend & Data
- **Base44 SDK**: Current backend integration
- **Supabase**: Planned backend (PostgreSQL, Auth, Realtime)
- **localStorage**: Fallback for development

### Payment Integration
- **M-Pesa**: Daraja API for mobile payments
- **Card Payments**: Testing-only implementation (localhost)

## Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd erick_project

# Install dependencies
npm install

# Create environment file
cp .env.base44-defaults .env.local
```

### Environment Variables
Required for Base44 backend:
```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
VITE_PUBLISHABLE_KEY=your_publishable_key
```

Optional for Supabase (future):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:5173`

## Authentication & Roles

### User Roles
1. **Creator (formerly Artist)**: Talent who profiles, showcases portfolio, applies to jobs
2. **Team**: Production groups with multiple members
3. **Client**: Producers/companies who post jobs and hire talent
4. **Backer**: Investors/sponsors who fund projects
5. **Admin**: Platform administrators

### Authentication Flow
- Login via `/SignIn` page
- Role-based dashboard routing
- JWT tokens stored in localStorage (Base44)
- Session managed via AuthContext

### Logout Behavior
- Logout redirects to landing page (`/`)
- Clears all auth tokens and session data
- Resets localStorage keys

## Shop & Auctions

### Shop Features
- **Product Categories**: Wardrobe, Equipment, Merchandise, Collectibles, Experiences
- **Auction Types**:
  - Time-based: Runs for X hours, random winner at end
  - Count-based: Closes when target participants reached
- **Fulfillment**: Physical or digital
- **Currency**: Kenyan Shillings (KES)

### Seed Products
Located in `src/data/shopProducts.js`:
- 10 sample products with varied categories
- Some have auction enabled
- Time-limited auction end times
- Participant counts for count-based auctions

### Cart & Checkout
- Cart stored in localStorage (`smartgigs_cart`)
- Checkout page supports M-Pesa and card payments
- Card details captured for testing (localhost only)
- Order management in admin panel

### Shop Services
- `listProducts()`: Fetch all products
- `getProduct(id)`: Fetch single product
- `isAuctionProduct(product)`: Check if auction
- `getAuctionInfo(product)`: Get auction status
- `joinAuction(product, user)`: Join auction
- `addToCart()`, `removeFromCart()`, `updateCartQuantity()`: Cart management
- `createOrder()`: Create order from cart
- `recordCardAttempt()`: Record card payment (testing)

## Admin Panel

### Admin Layout
- Modern, sleek sidebar design
- Collapsible sidebar (persisted to localStorage)
- Search functionality for modules
- User profile section
- Mobile-responsive

### Admin Modules

#### Main
- Dashboard
- System Admin Users
- Roles & Permissions
- Invites

#### User Management
- Clients
- Creators
- Projects
- Jobs
- Featured Jobs
- Categories
- Marquee/Ticker

#### Shop
- Products (with auction settings)
- Orders
- Card Payments
- Shop Settings
- Partners

#### Content & Communication
- Articles & Blogs
- Newsletter
- Mailing List
- Messages
- CMS — Page Content

#### Integrations
- SEO & CMS
- Image Storage
- Login Providers
- API Settings
- Payment Settings

#### System
- General Settings
- Analytics Dashboard
- Finance Dashboard
- Audit Logs
- Success Stories
- Recent Projects

### Admin Pages Implementation
- `AdminCMSPage.jsx`: Rich text editor for all site pages
- `AdminMailingListPage.jsx`: Newsletter subscriber management
- `AdminOrdersPage.jsx`: Order management with status tracking
- `AdminCardPaymentsPage.jsx`: Card payment capture (testing)
- `AdminPartnersPage.jsx`: Partner CRUD with logo management
- `AdminFeaturedWorkPage.jsx`: Featured jobs/projects management
- `AdminProductsPage.jsx`: Product management with auction settings

## Database Schema

### Supabase Schema
Complete schema available in `database/supabase_schema.sql`

### Key Tables
- `users`: User accounts and authentication
- `creator_profiles`: Creator/artist profiles
- `client_profiles`: Client/producer profiles
- `team_profiles`: Team/group profiles
- `backer_profiles`: Backer/investor profiles
- `projects`: Film/video projects
- `jobs`: Job postings
- `applications`: Job applications
- `messages`: In-app messaging
- `shop_products`: Shop products
- `shop_orders`: Orders
- `shop_cart`: Shopping cart
- `auctions`: Auction data
- `payments`: Payment records
- `partners`: Partner logos and info
- `cms_pages`: CMS content
- `newsletter_subscriptions`: Newsletter subscribers
- `audit_logs`: System audit trail

### RLS Policies
Row Level Security policies are defined for each table to ensure proper data access control.

## Environment Variables

### Required for Development
```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
VITE_PUBLISHABLE_KEY=your_publishable_key
```

### Optional (Supabase)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local Fallbacks
The app includes fallback values so it can boot without credentials for development.

## Build & Deployment

### Development Build
```bash
npm run dev
```
Runs Vite dev server on port 5173 with hot reload.

### Production Build
```bash
npm run build
```
Creates optimized production build in `dist/` directory.

### Docker Compose (Development)
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Maps host port 3000 to container port 5173
- Supports live reload
- Uses bind-mount for source code

### Docker (Production)
`docker-compose.yml` and `Dockerfile` are for production only - they bake the source and do not support live reload.

### PWA Configuration
Vite PWA plugin is conditionally enabled for production only to avoid service worker interference in development.

## Key Components

### Landing Page Components
- `Hero.jsx`: Hero section with parallax background
- `TrustBar.jsx`: Brand/partner carousel
- `JobSearch.jsx`: Job search interface
- `FeaturedJobs.jsx`: Featured jobs carousel with filters
- `ProfilesGigs.jsx`: Profiles and gigs section
- `HowItWorks.jsx`: How it works steps
- `InspiringPerformers.jsx`: Performer showcase
- `NewsAndVideos.jsx`: News and video content
- `CTASection.jsx`: Call-to-action section
- `MissionBanner.jsx`: Mission statement with parallax
- `Footer.jsx`: Footer with newsletter signup

### Shop Components
- `ShopShell.jsx`: Shop page wrapper
- `ProductCard.jsx`: Product display card
- `AuctionMeta.jsx`: Auction countdown and status
- `CardForm.jsx`: Card input form
- `CardLogos.jsx`: Payment method logos

### Dashboard Components
- `UnifiedSidebar.jsx`: Unified sidebar for all user roles
- `UnifiedTopbar.jsx`: Unified topbar with collapse functionality

## Recent Updates

### Completed (2026-10-06)
1. Fixed logout 404 issue - now redirects to landing page
2. Integrated shop seed products - shop page displays 10 products
3. Fixed FeaturedJobs design - working carousel with filter functionality
4. Added global country API for job location filtering
5. Fixed HiringTalent carousel - auto-scroll on hover implementation
6. Added ProfilesGigs section - two-column layout with parallax
7. Created PartnersCarousel component - dynamic partner logo display
8. Updated README.md with current branding
9. Created comprehensive system documentation
10. Build verification - passed successfully

### Pending
- Change 'artist' to 'creator/creative' throughout codebase (large refactoring)
- Improve landing page job search to be dynamic
- Fix search functionality on shop, jobs, talent pages

## Troubleshooting

### Build Issues
If build fails:
1. Check for missing dependencies: `npm install`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check environment variables in `.env.local`

### Authentication Issues
If login/logout fails:
1. Check Base44 credentials in environment variables
2. Clear localStorage and refresh
3. Check browser console for errors

### Shop Issues
If shop doesn't load products:
1. Check `shopService.js` is importing correctly
2. Verify `buildSeedProducts()` returns data
3. Check browser console for errors

## Support

For detailed documentation and support, refer to:
- Base44 Docs: https://docs.base44.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Tailwind Docs: https://tailwindcss.com
