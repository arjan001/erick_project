# SmartGigs Kenya - Complete System Handover Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Storage Configuration](#storage-configuration)
6. [Authentication & Authorization](#authentication--authorization)
7. [Admin Modules](#admin-modules)
8. [Artist Modules](#artist-modules)
9. [Client Modules](#client-modules)
10. [Backer Modules](#backer-modules)
11. [Team Modules](#team-modules)
12. [Jobs Module](#jobs-module)
13. [Messages Module](#messages-module)
14. [Network Module](#network-module)
15. [Projects Module](#projects-module)
16. [Support Module](#support-module)
17. [Shop & Commerce](#shop--commerce)
18. [Payment Gateway](#payment-gateway)
19. [Email Service](#email-service)
20. [SEO & CMS](#seo--cms)
21. [Deployment](#deployment)
22. [Environment Configuration](#environment-configuration)
23. [Required SQL Migrations](#required-sql-migrations)
24. [Troubleshooting](#troubleshooting)

---

## System Overview

SmartGigs Kenya is a comprehensive creative-industry marketplace platform built for the Kenyan film and entertainment industry. It connects actors, crew members, producers, casting managers, clients, creators, teams, and backers in a single ecosystem.

### Core Purpose
- **Talent Discovery**: Help production houses find talent (actors, crew, directors, etc.)
- **Job Matching**: Connect artists with job opportunities and productions
- **Networking**: Enable professional networking and collaboration
- **Project Funding**: Allow backers to invest in creative projects
- **E-commerce**: Shop for industry-related products and services
- **Communication**: Real-time messaging between all users
- **Support**: Ticket-based support system

### User Roles
1. **Artist** - Actors, crew members, creative professionals
2. **Client** - Production houses, casting managers, project owners
3. **Admin** - System administrators
4. **Backer** - Investors and project funders
5. **Team** - Creative teams and collectives

### Key Features
- Role-based portals with custom dashboards
- Profile management with portfolios
- Job board with production role selection
- Application tracking and management
- Real-time messaging with attachments
- Networking and connections
- Project management and funding
- Subscription plans and billing
- E-commerce shop
- Support ticket system
- Comprehensive admin panel

---

## Technology Stack

### Frontend
- **Framework**: React 18 with JSX
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS utility classes
- **Icons**: Lucide React
- **State Management**: React Context API (AuthContext, ShopContext)
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: Controlled components with validation
- **PWA**: VitePWA (production only)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime
- **File Uploads**: Supabase Storage buckets

### Payment Gateways
- **M-Pesa**: Makamesco/Nexus Pay integration
- **Card Payments**: Testing implementation (for production integration later)

### Email Service
- **Primary**: Resend API
- **Alternative**: SMTP configuration

### Deployment
- **VPS**: Ubuntu with Nginx, PM2
- **Domain**: smartgigs.oneplusafrica.com
- **SSL**: Let's Encrypt (Nginx)
- **Process Manager**: PM2

---

## Architecture

### Project Structure
```
erick_project/
├── src/
│   ├── app/                    # App configuration
│   │   ├── router/            # Route configuration
│   │   └── theme/             # Theme configuration
│   ├── components/            # Shared components
│   │   ├── admin/             # Admin-specific components
│   │   ├── artist/            # Artist-specific components
│   │   ├── client/            # Client-specific components
│   │   ├── landing/           # Landing page components
│   │   └── shared/            # Shared UI components
│   ├── contexts/              # React contexts
│   ├── data/                  # Static data
│   ├── hooks/                 # Custom React hooks
│   ├── layouts/               # Page layouts
│   ├── lib/                   # Core libraries
│   │   ├── supabase.js        # Supabase client
│   │   ├── supabaseEntities.js # Database entities
│   │   └── AuthContext.jsx    # Authentication context
│   ├── modules/               # Feature modules
│   │   ├── admin/             # Admin module (60 pages)
│   │   ├── artist/            # Artist module
│   │   ├── client/            # Client module
│   │   ├── backer/            # Backer module
│   │   ├── team/              # Team module
│   │   ├── jobs/              # Jobs module
│   │   ├── messages/          # Messages module
│   │   ├── network/           # Networking module
│   │   ├── projects/          # Projects module
│   │   ├── support/           # Support module
│   │   ├── auth/              # Authentication
│   │   └── maintenance/       # Maintenance mode
│   ├── pages/                 # Public pages
│   ├── services/              # External services
│   │   ├── emailService.js    # Email service
│   │   ├── makamescoService.js # M-Pesa service
│   │   └── notificationService.js # Notifications
│   ├── shared/                # Shared utilities
│   │   ├── services/          # Shared services
│   │   └── utils/             # Utility functions
│   └── main.jsx               # App entry point
├── database/                  # Database files
│   ├── migrations/           # SQL migrations
│   ├── supabase_schema.sql   # Complete schema
│   └── legacy_sql/           # Legacy SQL files
├── public/                    # Public assets
├── .env                       # Environment variables
├── .env.example              # Environment template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
└── REQUIRED_SQL_MIGRATIONS.md # Required migrations
```

### Data Flow
1. **User Request** → React Router → Module Page
2. **Page Component** → Supabase Entity → Supabase Client
3. **Supabase Client** → Supabase Backend (PostgreSQL)
4. **Response** → Component State → UI Update

### Authentication Flow
1. User signs in via Supabase Auth
2. AuthContext updates user state
3. RoleGuard checks user role
4. User redirected to appropriate dashboard
5. Token stored in Supabase Auth session

---

## Database Schema

### Core Tables

#### Users & Authentication
- **users** - User accounts and profiles
- **auth_providers** - Authentication provider configurations
- **user_roles** - Role assignments (artist, client, admin, backer, team)

#### Artist Module
- **artists** - Artist profiles and details
- **artist_skills** - Artist skills and disciplines
- **artist_portfolios** - Portfolio items and clips
- **artist_subscriptions** - Subscription records

#### Client Module
- **clients** - Client profiles and company details
- **client_subscriptions** - Client subscription records

#### Backer Module
- **backers** - Backer profiles and investment details
- **backer_investments** - Investment records
- **investment_tiers** - Investment tier configurations

#### Team Module
- **teams** - Team profiles and details
- **team_members** - Team member relationships

#### Jobs & Applications
- **jobs** - Job postings and opportunities
- **job_applications** - Application records with applied_role column
- **projects** - Project listings
- **project_applications** - Project applications

#### Messaging
- **conversations** - Conversation threads
- **messages** - Individual messages with attachment JSONB

#### Networking
- **connections** - Connection requests and relationships
- **connection_requests** - Pending connection requests

#### Commerce
- **products** - Shop products
- **orders** - Order records
- **order_items** - Order line items
- **cart_items** - Shopping cart
- **wishlists** - User wishlists

#### Subscriptions
- **subscription_packages** - Subscription plans and pricing
- **subscription_features** - Plan features and perks

#### Support
- **support_tickets** - Support ticket records
- **ticket_responses** - Ticket responses and conversations

#### Settings & Configuration
- **settings** - General application settings
- **payment_settings** - Payment gateway configurations
- **email_settings** - Email service configuration
- **api_configuration** - API settings and endpoints
- **integrations_settings** - Third-party integrations
- **rate_limiting_settings** - Rate limiting rules

#### CMS & SEO
- **cms_pages** - CMS-managed pages
- **cms_assets** - CMS-managed assets
- **seo_settings** - SEO meta tags and configurations

#### Audit & Analytics
- **audit_logs** - System audit trail
- **analytics_events** - User analytics events
- **api_usage_logs** - API usage tracking

### RLS Policies
All tables have Row Level Security (RLS) policies to ensure:
- Users can only access their own data
- Admins have full access
- Public access is limited to specific tables
- Role-based access control

---

## Storage Configuration

### Supabase Storage Buckets

#### Profile Images
- **artist-profiles** - Artist profile photos
- **team-profiles** - Team profile images
- **client-profiles** - Client profile images
- **backer-profiles** - Backer profile images

#### Portfolio & Media
- **portfolio-clips** - Portfolio video clips and thumbnails
- **job-images** - Job posting images
- **job-attachments** - Job attachment files

#### Commerce
- **shop-images** - Product images
- **category-images** - Category images

#### CMS & Content
- **cms-assets** - CMS-managed assets
- **featured-content** - Featured content images

#### Communication
- **message-attachments** - Message attachments (images, videos, files)

#### General
- **general-uploads** - General file uploads

### Storage Policies
- Public read access for profile images and assets
- Authenticated upload access for users
- Admin full access to all buckets
- File size limits enforced
- Allowed file types restricted

---

## Authentication & Authorization

### Authentication Methods

#### Primary: Supabase Auth
- Email/password authentication
- Social login providers (optional)
- Password reset via email
- OTP for sensitive operations
- Session management

#### Secondary: Clerk (Optional)
- Configured in AdminAuthProvidersPage
- Disabled by default
- Can be enabled as backup

### Authorization System

#### Role-Based Access Control (RBAC)
Roles defined in user_roles table:
- **artist** - Access to artist portal
- **client** - Access to client portal
- **admin** - Full admin access
- **backer** - Access to backer portal
- **team** - Access to team portal

#### RoleGuard Component
- Checks user role before allowing access
- Redirects unauthorized users
- Applied to route-level protection

#### Permission System
- Fine-grained permissions for admin modules
- RolePermissionsPage manages permissions
- Role-based UI element visibility

### Test Credentials
Preserved for testing purposes (as per client requirement):
- Test login credentials available
- Do not remove without client approval

---

## Admin Modules

The admin module contains 60+ pages for complete system management.

### Dashboard & Analytics

#### AdminDashboardPage
**Purpose**: Main admin dashboard with system overview

**Features**:
- User statistics (total artists, clients, teams, backers)
- Job and application metrics
- Revenue and subscription data
- Recent activity feed
- Quick action buttons
- System health indicators

**Database Tables**:
- users, artists, clients, teams, backers
- jobs, job_applications
- subscriptions, orders
- analytics_events

**Key Metrics**:
- Total users by role
- Active jobs
- Pending applications
- Monthly revenue
- Subscription counts

#### AdminAnalyticsPage
**Purpose**: Advanced analytics and reporting

**Features**:
- User growth charts
- Job posting trends
- Application conversion rates
- Revenue analytics
- Geographic distribution
- Custom date range filters

**Database Tables**:
- analytics_events
- users
- jobs
- job_applications
- orders

#### AdminFinanceDashboardPage
**Purpose**: Financial overview and reporting

**Features**:
- Revenue breakdown
- Subscription revenue
- Shop revenue
- Payment method distribution
- Refund tracking
- Financial reports export

**Database Tables**:
- orders
- subscriptions
- makamesco_transactions
- payment_settings

### User Management

#### AdminUsersPage
**Purpose**: Manage all system users

**Features**:
- User list with search and filters
- User role management
- Account status (active/suspended)
- Bulk actions (activate, suspend, delete)
- User activity logs
- Export user data

**Database Tables**:
- users
- user_roles
- audit_logs

**Actions**:
- View user details
- Change user role
- Suspend/activate account
- Delete user
- View activity history

#### AdminUserManagementPage
**Purpose**: Advanced user management

**Features**:
- Detailed user profiles
- Permission management
- Role assignments
- Account verification
- Password reset
- User impersonation (admin only)

**Database Tables**:
- users
- user_roles
- artists, clients, teams, backers

#### AdminRolesPage
**Purpose**: Manage system roles

**Features**:
- Role definitions
- Role permissions
- Role hierarchy
- Role statistics
- Custom role creation

**Database Tables**:
- user_roles
- roles (if using separate roles table)

#### AdminRolesPermissionsPage
**Purpose**: Configure role permissions

**Features**:
- Permission matrix
- Granular permission control
- Module-based permissions
- Action-based permissions (read, write, delete)
- Permission templates

**Database Tables**:
- user_roles
- permissions (if using separate permissions table)

### Artist Management

#### AdminArtistsPage
**Purpose**: Manage artist accounts

**Features**:
- Artist list with profiles
- Artist verification status
- Portfolio review
- Skill management
- Suspension/banning
- Artist statistics

**Database Tables**:
- artists
- artist_skills
- artist_portfolios
- users

**Actions**:
- View artist profile
- Verify artist
- Suspend artist
- Manage skills
- Review portfolio

#### ArtistAdminPage
**Purpose**: Detailed artist management

**Features**:
- Complete artist profile view
- Edit artist details
- Manage portfolio items
- Skill assessment
- Verification workflow
- Communication history

**Database Tables**:
- artists
- artist_skills
- artist_portfolios
- connections
- messages

### Client Management

#### AdminClientsPage
**Purpose**: Manage client accounts

**Features**:
- Client list with company details
- Subscription status
- Job posting history
- Payment status
- Account verification
- Client analytics

**Database Tables**:
- clients
- jobs
- subscriptions
- orders
- users

**Actions**:
- View client profile
- Verify client
- Manage subscriptions
- View job postings
- Payment management

### Team Management

#### AdminTeamsPage
**Purpose**: Manage team accounts

**Features**:
- Team list with profiles
- Team member management
- Team verification
- Portfolio review
- Team statistics
- Suspension/banning

**Database Tables**:
- teams
- team_members
- artist_portfolios
- users

**Actions**:
- View team profile
- Verify team
- Manage members
- Review portfolio
- Suspend team

#### TeamAdminPage
**Purpose**: Detailed team management

**Features**:
- Complete team profile view
- Edit team details
- Manage team members
- Portfolio management
- Verification workflow
- Team performance metrics

**Database Tables**:
- teams
- team_members
- artist_portfolios
- projects

#### TeamsQueue
**Purpose**: Team approval queue

**Features**:
- Pending team registrations
- Review workflow
- Approval/rejection
- Bulk actions
- Notification system

**Database Tables**:
- teams
- team_members
- notifications

### Backer Management

#### AdminBackersPage
**Purpose**: Manage backer accounts

**Features**:
- Backer list with investment details
- Investment history
- Account verification
- Backer tier management
- Communication history
- Backer analytics

**Database Tables**:
- backers
- backer_investments
- investment_tiers
- users

**Actions**:
- View backer profile
- Verify backer
- View investments
- Manage tiers
- Contact backer

### Job Management

#### AdminJobsPage
**Purpose**: Manage job postings

**Features**:
- Job list with filters
- Job approval workflow
- Featured job management
- Job statistics
- Bulk actions (approve, reject, delete)
- Job analytics

**Database Tables**:
- jobs
- job_applications
- users
- clients

**Actions**:
- View job details
- Approve/reject job
- Feature job
- Edit job
- Delete job
- View applications

#### ProjectsQueue
**Purpose**: Project approval queue

**Features**:
- Pending project submissions
- Review workflow
- Approval/rejection
- Project details review
- Team verification

**Database Tables**:
- projects
- project_applications
- teams

### Content Management

#### AdminCMSPage
**Purpose**: Content management system

**Features**:
- Page editor
- Rich text content
- Media library integration
- Page templates
- SEO settings
- Publishing workflow

**Database Tables**:
- cms_pages
- cms_assets
- seo_settings

**Actions**:
- Create new page
- Edit existing page
- Manage media
- Configure SEO
- Publish/unpublish

#### AdminSEOCMSPage
**Purpose**: SEO-focused CMS

**Features**:
- Meta tag management
- Open Graph tags
- Sitemap generation
- Robots.txt configuration
- Canonical URLs
- Structured data

**Database Tables**:
- seo_settings
- cms_pages

#### AdminSEOPage
**Purpose**: Global SEO settings

**Features**:
- Site-wide meta tags
- Default titles and descriptions
- Social media integration
- Analytics tracking codes
- Performance optimization

**Database Tables**:
- seo_settings
- settings

#### AdminArticlesPage
**Purpose**: Blog and news management

**Features**:
- Article editor
- Categories and tags
- Featured articles
- Scheduling
- SEO configuration
- Comments management

**Database Tables**:
- articles (if exists)
- cms_pages

#### AdminSuccessStoriesPage
**Purpose**: Success stories management

**Features**:
- Story editor
- Artist/client testimonials
- Featured stories
- Media uploads
- Publishing workflow

**Database Tables**:
- success_stories (if exists)
- cms_pages

#### AdminNewsletterPage
**Purpose**: Newsletter management

**Features**:
- Newsletter editor
- Subscriber management
- Scheduling
- Analytics (open rates, clicks)
- Template management

**Database Tables**:
- newsletters (if exists)
- mailing_list

#### AdminMailingListPage
**Purpose**: Mailing list management

**Features**:
- Subscriber list
- Import/export
- Segmentation
- Unsubscribe management
- Campaign history

**Database Tables**:
- mailing_list
- newsletter_campaigns

### Commerce Management

#### AdminProductsPage
**Purpose**: Product management

**Features**:
- Product list with inventory
- Product editor
- Category management
- Pricing management
- Stock tracking
- Product images

**Database Tables**:
- products
- categories
- product_images
- inventory

**Actions**:
- Add new product
- Edit product
- Manage categories
- Update stock
- Delete product

#### AdminOrdersPage
**Purpose**: Order management

**Features**:
- Order list with filters
- Order details view
- Status management (pending, processing, shipped, delivered)
- Shipping management
- Refund processing
- Order analytics

**Database Tables**:
- orders
- order_items
- products
- users

**Actions**:
- View order details
- Update status
- Process refund
- Print invoice
- Contact customer

#### AdminShopSettingsPage
**Purpose**: Shop configuration

**Features**:
- Store settings
- Tax configuration
- Shipping options
- Payment methods
- Currency settings
- Inventory settings

**Database Tables**:
- settings
- payment_settings
- shipping_settings

#### AdminShopAuctionsPage
**Purpose**: Auction management (if enabled)

**Features**:
- Auction listings
- Bidding management
- Auction timer
- Winner selection
- Payment processing

**Database Tables**:
- auctions (if exists)
- auction_bids

### Subscription Management

#### AdminSubscriptionSettingsPage
**Purpose**: Subscription plan configuration

**Features**:
- Plan editor (name, price, features)
- Monthly/yearly pricing
- Feature toggles
- Plan activation
- Trial configuration

**Database Tables**:
- subscription_packages
- subscription_features

**Actions**:
- Create new plan
- Edit existing plan
- Activate/deactivate plan
- Configure features
- Set pricing

#### AdminSubscriptionsPage
**Purpose**: Subscription management

**Features**:
- Active subscriptions list
- Subscription history
- Payment tracking
- Renewal management
- Cancellation handling
- Revenue reports

**Database Tables**:
- artist_subscriptions
- client_subscriptions
- subscription_packages
- orders

**Actions**:
- View subscription details
- Cancel subscription
- Process renewal
- Refund handling
- Upgrade/downgrade

#### AdminSubscriptionSalesPage
**Purpose**: Subscription sales analytics

**Features**:
- Sales by plan
- Conversion rates
- Churn analysis
- Revenue trends
- Customer lifetime value
- Forecasting

**Database Tables**:
- artist_subscriptions
- client_subscriptions
- orders
- analytics_events

### Payment Management

#### AdminPaymentPage
**Purpose**: Payment overview

**Features**:
- Payment history
- Payment methods
- Transaction status
- Refund tracking
- Revenue analytics

**Database Tables**:
- orders
- makamesco_transactions
- payment_settings

#### AdminPaymentSettingsPage
**Purpose**: Payment gateway configuration

**Features**:
- M-Pesa integration settings
- Card payment settings
- Payment method toggles
- Transaction fees
- Webhook configuration
- Test mode

**Database Tables**:
- payment_settings
- makamesco_transactions
- api_configuration

**Actions**:
- Configure M-Pesa API keys
- Enable/disable payment methods
- Set transaction fees
- Configure webhooks
- Test payments

#### AdminCardPaymentsPage
**Purpose**: Card payment management

**Features**:
- Card transaction history
- Failed transaction review
- Chargeback handling
- Card verification
- Token management

**Database Tables**:
- orders
- card_transactions (if exists)
- payment_settings

#### AdminFinancePage
**Purpose**: Financial management

**Features**:
- Revenue reports
- Expense tracking
- Profit/loss statements
- Tax reporting
- Export financial data
- Multi-currency support

**Database Tables**:
- orders
- subscriptions
- makamesco_transactions
- financial_records (if exists)

### Messaging & Communication

#### AdminMessagesPage
**Purpose**: Admin messaging system

**Features**:
- Message inbox
- Conversation view
- Attachment handling (images, videos, files)
- Typing indicators
- Read receipts
- User presence (online/offline/last seen)
- Voice note recording
- Message search
- Bulk messaging

**Database Tables**:
- conversations
- messages
- users
- message_attachments (storage)

**Actions**:
- Send messages
- Upload attachments
- Record voice notes
- Search conversations
- View message history

### Support Management

#### AdminTicketsPage
**Purpose**: Support ticket management

**Features**:
- Ticket list with filters
- Ticket details view
- Response management
- Status updates (open, in_progress, resolved, closed)
- Priority levels
- Assignment system
- Ticket analytics
- Bulk actions

**Database Tables**:
- support_tickets
- ticket_responses
- users

**Actions**:
- View ticket details
- Add response
- Update status
- Assign to admin
- Delete ticket
- View conversation history

**Notifications**:
- User notified when admin responds
- Admin notified on new ticket
- Notifications in navbar, dashboard, notification module

### Settings & Configuration

#### AdminSettingsPage
**Purpose**: General application settings

**Features**:
- Site configuration
- Default settings
- Feature flags
- Maintenance mode
- Site branding
- Legal pages links

**Database Tables**:
- settings

#### AdminGeneralSettingsPage
**Purpose**: General settings management

**Features**:
- Site name and description
- Contact information
- Social media links
- Legal page configuration
- Default timezone
- Date/time format

**Database Tables**:
- settings

#### AdminEmailSettingsPage
**Purpose**: Email service configuration

**Features**:
- Resend API key
- SMTP configuration
- Email templates
- Sender details
- Email testing
- Delivery logs

**Database Tables**:
- email_settings

**Actions**:
- Configure Resend API
- Setup SMTP
- Edit templates
- Test email delivery
- View delivery logs

#### AdminAPISettingsPage
**Purpose**: API configuration

**Features**:
- API endpoints configuration
- Rate limiting settings
- Integration settings
- API key management
- Usage monitoring
- Webhook configuration

**Database Tables**:
- api_configuration
- rate_limiting_settings
- integrations_settings
- api_keys
- api_usage_logs

**Actions**:
- Configure API endpoints
- Set rate limits
- Manage integrations
- Generate API keys
- Monitor usage

#### AdminStoragePage
**Purpose**: Storage management

**Features**:
- Storage bucket configuration
- File size limits
- Allowed file types
- Storage usage analytics
- Cleanup tools
- CDN configuration

**Database Tables**:
- storage_settings (if exists)
- settings

#### AdminFileUploadSettingsPage
**Purpose**: File upload configuration

**Features**:
- File type restrictions
- Size limits per type
- Virus scanning settings
- Upload validation
- Storage quotas

**Database Tables**:
- settings
- storage_settings

#### AdminMaintenancePage
**Purpose**: Maintenance mode control

**Features**:
- Enable/disable maintenance mode
- Maintenance message
- Whitelist users
- Scheduled maintenance
- System health checks

**Database Tables**:
- settings
- maintenance_logs (if exists)

### Content & Features

#### AdminFeaturedBrandsPage
**Purpose**: Featured brand management

**Features**:
- Brand list
- Featured brand configuration
- Brand images
- Brand descriptions
- Display order

**Database Tables**:
- featured_brands (if exists)
- cms_assets

#### AdminFeaturedCreativesPage
**Purpose**: Featured creatives management

**Features**:
- Featured artist list
- Spotlight configuration
- Creative profiles
- Display order
- Analytics

**Database Tables**:
- artists
- featured_creatives (if exists)

#### AdminFeaturedWorkPage
**Purpose**: Featured work showcase

**Features**:
- Portfolio showcase
- Featured projects
- Work categories
- Media management
- Display settings

**Database Tables**:
- artist_portfolios
- projects
- featured_work (if exists)

#### AdminPartnersPage
**Purpose**: Partner management

**Features**:
- Partner list
- Partner logos
- Partner descriptions
- Partner links
- Partner tier management

**Database Tables**:
- partners (if exists)
- cms_assets

#### AdminTickerPage
**Purpose**: News ticker management

**Features**:
- Ticker messages
- Display order
- Ticker timing
- Ticker styling
- Message scheduling

**Database Tables**:
- ticker_messages (if exists)
- settings

#### AdminPopupsPage
**Purpose**: Popup/modal management

**Features**:
- Popup creation
- Trigger conditions
- Display frequency
- Popup content
- Target audience
- Analytics

**Database Tables**:
- popups (if exists)
- settings

#### AdminCategoriesPage
**Purpose**: Category management

**Features**:
- Category hierarchy
- Category images
- Category descriptions
- SEO settings
- Category ordering

**Database Tables**:
- categories
- category_images (storage)

### Audit & Security

#### AdminAuditLogsPage
**Purpose**: System audit trail

**Features**:
- Activity log viewer
- Filter by user/action
- Date range filtering
- Export logs
- Security alerts
- Anomaly detection

**Database Tables**:
- audit_logs
- users

#### AdminDatabaseBackupPage
**Purpose**: Database backup management

**Features**:
- Manual backup
- Scheduled backups
- Backup history
- Restore functionality
- Backup export
- Backup integrity checks

**Database Tables**:
- backup_records (if exists)
- All database tables

### Integrations

#### AdminAuthProvidersPage
**Purpose**: Authentication provider management

**Features**:
- Supabase Auth configuration
- Clerk integration (optional)
- Social login providers
- Provider enable/disable
- Test credentials management

**Database Tables**:
- auth_providers
- settings

**Actions**:
- Configure Supabase Auth
- Enable/disable Clerk
- Add social providers
- Manage test credentials

#### AdminLoginProvidersPage
**Purpose**: Login method configuration

**Features**:
- Login method priority
- Default provider
- Provider-specific settings
- Redirection rules

**Database Tables**:
- auth_providers
- settings

#### AdminInvitesPage
**Purpose**: Invitation management

**Features**:
- Create invitations
- Invitation codes
- Invite tracking
- Expiration settings
- Bulk invitations
- Invitation analytics

**Database Tables**:
- invitations (if exists)
- users

#### AdminInvitesManagementPage
**Purpose**: Advanced invitation management

**Features**:
- Invitation templates
- Targeted invitations
- Role-based invites
- Invitation approval workflow
- Invitation rewards

**Database Tables**:
- invitations
- invitation_templates (if exists)

### Approval Queues

#### ArtistsQueue
**Purpose**: Artist approval queue

**Features**:
- Pending artist registrations
- Review workflow
- Approval/rejection
- Verification checks
- Bulk actions
- Notification system

**Database Tables**:
- artists
- artist_skills
- notifications

#### PortfolioQueue
**Purpose**: Portfolio approval queue

**Features**:
- Pending portfolio submissions
- Content review
- Approval/rejection
- Quality checks
- Feedback system

**Database Tables**:
- artist_portfolios
- artists
- notifications

### Work Approval

#### AdminWorkApprovalPage
**Purpose**: Work/content approval

**Features**:
- Pending work submissions
- Review workflow
- Approval/rejection
- Quality guidelines
- Feedback system
- Analytics

**Database Tables**:
- artist_portfolios
- projects
- submissions (if exists)

### Recent Projects

#### AdminRecentProjectsPage
**Purpose**: Recent projects overview

**Features**:
- Recent project list
- Project status
- Quick actions
- Project analytics
- Featured projects

**Database Tables**:
- projects
- project_applications
- teams

### API Documentation

#### AdminAPIPage
**Purpose**: API documentation and testing

**Features**:
- API endpoint documentation
- Request/response examples
- API testing interface
- Authentication details
- Rate limit information
- Error codes

**Database Tables**:
- api_configuration
- api_usage_logs

---

## Artist Modules

### Dashboard

#### ArtistDashboardPage
**Purpose**: Main artist dashboard with activity overview

**Features**:
- Statistics cards (applications, connections, profile views)
- Job opportunities from dashboard (clickable, opens Jobs module)
- Activity chart showing engagement
- Recent conversations
- Profile completion ring
- Connects tracker
- Quick notes
- Saved jobs
- Upcoming auditions/jobs
- Subscription status

**Database Tables**:
- jobs
- job_applications
- connections
- messages
- artists
- artist_subscriptions
- saved_jobs

**Key Workflows**:
- Click job from dashboard → Opens Jobs module with job selected
- Apply to jobs with production role selection
- View applications status
- Manage saved jobs
- Track profile completion

### Profile Management

#### ArtistProfilePage
**Purpose**: Complete artist profile management

**Features**:
- Personal information (name, bio, location)
- Profile photo upload
- Skills and disciplines management
- Portfolio management (video clips, images)
- Reel URL
- Credits and experience
- Education background
- Representation details
- Verification status
- Social media links
- Resume/CV upload

**Database Tables**:
- artists
- artist_skills
- artist_portfolios
- artist_social_links (if exists)

**Actions**:
- Edit profile details
- Upload profile photo
- Add/remove skills
- Add portfolio items
- Update reel URL
- Add credits
- Manage education
- Link social media

### Jobs & Applications

#### ArtistJobsPage
**Purpose**: Job browsing and application management

**Features**:
- Job board with filters (role, skill, location, project type, paid)
- Job list with card view
- Job detail panel (right side)
- Production role selection (dropdown with Apply button)
- Complete job details display
- Application tracking
- Saved jobs
- Applications tab with status
- Invitations tab (future feature)

**Database Tables**:
- jobs
- job_applications
- projects
- applications

**Job Details Display**:
- Job type (Job/Project)
- Budget type and rate
- Employment type
- Production type
- Location (city, country, remote)
- Audition date and location
- Submission deadline
- Requirements list
- Responsibilities list
- Required skills
- Client information

**Production Role Selection**:
- Dropdown with chevron icon
- Shows all available roles from discipline array
- Each role has description preview
- "Apply" button next to each role
- Direct apply to specific role
- Selected role highlighted in blue
- Role persists in applied_role column

**Application Flow**:
1. Browse jobs with filters
2. Click job to view details
3. Select production role (if applicable)
4. Click Apply (from dropdown or main button)
5. Confirmation dialog shows job type, client, role
6. Application submitted with applied_role
7. Status tracked in Applications tab

**URL Integration**:
- Dashboard job clicks use `/Jobs?jobId=X&isProject=true/false`
- ArtistJobsPage reads URL params to auto-select job
- Auto-selects first role for production jobs

### Subscriptions

#### ArtistSubscriptionPage
**Purpose**: Subscription plan management

**Features**:
- Current subscription display
- Available plans comparison
- Feature comparison
- Pricing (monthly/yearly)
- Upgrade/downgrade options
- Subscription history
- Payment method management
- Cancel subscription

**Database Tables**:
- artist_subscriptions
- subscription_packages
- subscription_features

#### ArtistSubscriptionCheckoutPage
**Purpose**: Subscription purchase flow

**Features**:
- Plan selection
- Payment method selection (M-Pesa, Card)
- M-Pesa STK Push integration
- Card payment (testing mode)
- Order confirmation
- Receipt generation
- Notification of purchase

**Database Tables**:
- artist_subscriptions
- orders
- payment_settings

**Payment Methods**:
- M-Pesa: Makamesco/Nexus Pay integration
- Card: Testing mode (saves details, shows "Card declined")
- Settings-controlled availability

### Finance

#### ArtistFinancePage
**Purpose**: Financial management for artists

**Features**:
- Earnings overview
- Payment history
- Withdrawal requests
- Banking information
- Tax information
- Invoices
- Payout settings

**Database Tables**:
- artist_earnings (if exists)
- withdrawals (if exists)
- banking_info (if exists)

#### ArtistBankingPage
**Purpose**: Banking details management

**Features**:
- Bank account details
- M-Pesa number
- Withdrawal preferences
- Payout schedule
- Tax compliance

**Database Tables**:
- banking_info (if exists)
- artists

### Support

#### ArtistTicketsPage
**Purpose**: Support ticket submission and management

**Features**:
- Create new ticket
- View ticket history
- Ticket status tracking
- Add responses to tickets
- View admin responses
- Ticket notifications
- Attachment support

**Database Tables**:
- support_tickets
- ticket_responses

**Ticket Fields**:
- Title (subject)
- Category
- Priority
- Description
- Status (open, in_progress, resolved, closed, withdrawn)

**Notifications**:
- User notified when admin responds
- Admin notified on new ticket
- Notifications in navbar, dashboard, notification module

---

## Client Modules

### Dashboard

#### ClientDashboardPage
**Purpose**: Main client dashboard

**Features**:
- Job posting statistics
- Application statistics
- Active jobs list
- Recent applications
- Team activity
- Subscription status
- Quick actions (post job, view applications)
- Analytics overview

**Database Tables**:
- jobs
- job_applications
- clients
- client_subscriptions

### Talent Browsing

#### BrowseTalentPage
**Purpose**: Browse and search for talent

**Features**:
- Talent search with filters
- Filter by skills, location, experience
- Talent card view with profiles
- Portfolio preview
- Save talent to favorites
- Contact talent
- View talent details

**Database Tables**:
- artists
- artist_skills
- artist_portfolios
- connections

**Filters**:
- Skills/disciplines
- Location (city, country)
- Experience level
- Availability
- Rate range

### Job Management

#### ClientJobsPage
**Purpose**: Job posting and management

**Features**:
- Create new job posting
- Edit existing jobs
- Job templates
- Bulk job posting
- Job status management
- Application management
- Candidate review
- Interview scheduling

**Database Tables**:
- jobs
- job_applications
- clients

**Job Creation**:
- Job title and description
- Job type (single role, production)
- Budget and rate
- Location (remote/on-site)
- Requirements
- Responsibilities
- Skills needed
- Production roles (discipline array)
- Audition details
- Submission deadline

### Applications

#### ClientApplicationsPage
**Purpose**: Manage job applications

**Features**:
- Application list by job
- Application filters (status, role)
- Applicant profile view
- Applied role display
- Cover letter review
- Portfolio review
- Status updates (pending, reviewed, shortlisted, hired, rejected)
- Bulk actions
- Communication with applicants

**Database Tables**:
- job_applications
- artists
- jobs

**Application Details**:
- Applicant profile
- Applied role (for production jobs)
- Cover letter
- Portfolio
- Skills match
- Status
- Application date

### Messaging

#### ClientMessagesPage
**Purpose**: Client messaging system

**Features**:
- Conversation list
- Real-time messaging
- File attachments
- Image/video previews
- Voice notes
- Typing indicators
- Read receipts
- User presence
- Message search

**Database Tables**:
- conversations
- messages
- users

### Support

#### ClientTicketsPage
**Purpose**: Support ticket management

**Features**:
- Create new ticket
- View ticket history
- Add responses
- Track status
- Admin responses
- Notifications

**Database Tables**:
- support_tickets
- ticket_responses

**Ticket Fields**:
- Subject (title)
- Category
- Priority
- Description
- Status

### Subscriptions

#### ClientSubscriptionPage
**Purpose**: Client subscription management

**Features**:
- Current subscription
- Plan comparison
- Upgrade/downgrade
- Payment history
- Cancel subscription

**Database Tables**:
- client_subscriptions
- subscription_packages

### Analytics

#### ClientAnalyticsPage
**Purpose**: Client analytics and insights

**Features**:
- Job posting analytics
- Application conversion rates
- Talent reach
- Engagement metrics
- ROI tracking
- Export reports

**Database Tables**:
- jobs
- job_applications
- analytics_events

---

## Backer Modules

### Dashboard

#### BackerDashboardPage
**Purpose**: Main backer dashboard

**Features**:
- Investment overview
- Portfolio performance
- Active investments
- Available projects
- Returns tracking
- Quick actions
- Investment alerts

**Database Tables**:
- backers
- backer_investments
- projects
- investment_tiers

### Projects

#### BackerProjectsPage
**Purpose**: Browse investment opportunities

**Features**:
- Project listing
- Investment details
- ROI projections
- Project updates
- Team information
- Investment tiers
- Due diligence documents

**Database Tables**:
- projects
- backer_investments
- investment_tiers
- teams

### Investments

#### BackerInvestmentsPage
**Purpose**: Manage active investments

**Features**:
- Investment portfolio
- Performance tracking
- Returns received
- Upcoming payouts
- Investment documents
- Exit strategy

**Database Tables**:
- backer_investments
- projects
- investment_tiers

### Investment Tiers

#### BackerInvestmentTiersPage
**Purpose**: View and select investment tiers

**Features**:
- Tier comparison
- Tier benefits
- Investment requirements
- Expected returns
- Tier restrictions
- Upgrade options

**Database Tables**:
- investment_tiers
- backer_investments

### Deals

#### BackerDealsPage
**Purpose**: Investment deal management

**Features**:
- Deal pipeline
- Term sheets
- Negotiation tracking
- Legal documents
- E-signature
- Deal closure

**Database Tables**:
- deals (if exists)
- backer_investments
- e_signatures (if exists)

### Updates

#### BackerProjectUpdatesPage
**Purpose**: Receive project updates

**Features**:
- Update feed
- Milestone tracking
- Financial reports
- Team updates
- Comment on updates
- Notification settings

**Database Tables**:
- project_updates (if exists)
- projects
- backer_investments

### Partners

#### BackerPartnersPage
**Purpose**: Networking with other backers

**Features**:
- Backer directory
- Connection requests
- Co-investment opportunities
- Partner projects
- Discussion forums

**Database Tables**:
- backers
- connections
- projects

### Profile

#### BackerProfilePage
**Purpose**: Backer profile management

**Features**:
- Personal information
- Investment preferences
- Portfolio details
- Accreditation status
- Contact information
- Social links

**Database Tables**:
- backers
- investment_preferences (if exists)

### Finance

#### BackerBankingPage
**Purpose**: Banking and payout management

**Features**:
- Bank account details
- Payout preferences
- Tax information
- Investment accounts
- Transaction history

**Database Tables**:
- banking_info (if exists)
- backers

### Analytics

#### BackerAnalyticsPage
**Purpose**: Investment analytics

**Features**:
- Portfolio performance
- ROI analysis
- Risk assessment
- Sector allocation
- Market trends
- Comparative analysis

**Database Tables**:
- backer_investments
- projects
- analytics_events

---

## Team Modules

### Dashboard
(Note: Team module structure similar to artist module with team-specific features)

### Profile Management
- Team profile with member management
- Team portfolio
- Team skills and disciplines
- Team verification

### Projects
- Project submissions
- Project applications
- Team collaboration

### Subscriptions
- Team subscription plans
- Member pricing

---

## Jobs Module

### Job Board

#### ArtistJobsPage
**Purpose**: Central job marketplace for artists

**Features**:
- Job board with comprehensive filters
- Production role selection
- Job detail panel
- Application tracking
- Saved jobs
- Applications management

**Database Tables**:
- jobs
- job_applications
- projects

**Filters**:
- Role (all, actor, director, crew, etc.)
- Skill (specific skills)
- Location (city, country, remote)
- Project type (film, TV, commercial, etc.)
- Paid (all, paid, unpaid)

**Production Role Selection**:
- Dropdown interface with chevron
- Shows all roles from discipline array
- Role description preview
- Apply button per role
- Direct application to specific role
- Selected role persists to applied_role column

**Job Details**:
- Complete job information display
- Type, category, budget, rate
- Location and remote status
- Audition details
- Submission deadline
- Requirements and responsibilities
- Required skills
- Client information

**Application Process**:
1. Browse and filter jobs
2. Click job to view details
3. Select production role (if applicable)
4. Apply via dropdown or main button
5. Confirmation with job/role details
6. Application saved with applied_role
7. Track in Applications tab

**URL Integration**:
- Dashboard links use `/Jobs?jobId=X&isProject=true/false`
- Auto-selects job and role from URL params
- Seamless navigation from dashboard

---

## Messages Module

### Messaging System

#### MessagesPage
**Purpose**: Real-time messaging between users

**Features**:
- Conversation list
- Real-time message sending/receiving
- File attachments (images, videos, documents)
- Attachment previews in chat history
- Voice note recording with controls
- Typing indicators
- Read receipts
- User presence (online/offline/last seen)
- Message search
- Conversation archiving

**Database Tables**:
- conversations
- messages (with attachment JSONB column)
- users

**Storage**:
- message-attachments bucket for files
- Attachment structure: { url, type, name, size }

**Message Features**:
- Text-only messages
- Attachment-only messages
- Text + attachment messages
- Enter key to send
- Upload error handling
- Image thumbnails in chat
- Video inline playback
- Audio player for voice notes
- File download cards

**Voice Recorder**:
- Start/pause/resume recording
- Elapsed time display (MM:SS)
- Stop recording
- Delete/cancel recording
- Timer cleanup
- Visual recording indicator

**RLS Policies**:
- Permissive policies for authenticated users
- remove_messages_rls.sql migration required

**Call Integration**:
- Phone and video icons present
- WebRTC implementation planned
- Coming soon alert on click

---

## Network Module

### Networking System

#### NetworkPage
**Purpose**: Professional networking and connections

**Features**:
- Connection suggestions
- Connection requests (sent/received)
- Pending requests management
- Accepted connections
- Skill-based matching
- Profile similarity scoring
- Connection history

**Database Tables**:
- connections
- connection_requests
- artists
- teams

**Connection States**:
- Pending (sent/received)
- Accepted
- Rejected
- Withdrawn

**Matching Algorithm**:
- Skill overlap scoring
- Location proximity
- Experience level match
- Disciplines compatibility

**Error Handling**:
- Fixed setSentRequests error
- Fixed duplicate declaration error
- Proper state management

---

## Projects Module

### Project Management

#### Projects functionality is integrated into:
- Client job posting
- Team project submissions
- Backer investment opportunities
- Admin project approval

**Database Tables**:
- projects
- project_applications
- teams

**Project Features**:
- Project type and category
- Budget range
- Location details
- Team information
- Backing options
- Verification status
- Featured projects

---

## Support Module

### Support Ticket System

#### AdminTicketsPage
**Purpose**: Admin support ticket management

**Features**:
- Ticket list with filters
- Ticket details modal
- Response management
- Status updates
- Priority levels
- Assignment system
- Delete tickets
- View conversation history
- Eye icon to view details
- Trash icon to delete

**Database Tables**:
- support_tickets
- ticket_responses
- users

**Ticket Workflow**:
1. User creates ticket
2. Ticket saved with status 'open'
3. Admin notified
4. Admin reviews ticket
5. Admin adds response
6. User notified of response
7. Status updated to 'in_progress'
8. Continued conversation
9. Ticket resolved/closed

**Status Values**:
- open
- in_progress
- resolved
- closed
- withdrawn

**Notifications**:
- User receives notification on admin response
- Admin receives notification on new ticket
- Notifications in navbar, dashboard, notification module
- Blinking unread indicator

#### ArtistTicketsPage
**Purpose**: Artist support tickets

**Features**:
- Create new ticket
- View ticket history
- Add responses
- Track status
- Receive admin responses

**Database Tables**:
- support_tickets
- ticket_responses

**Ticket Fields**:
- Title
- Category
- Priority
- Description
- Status

#### ClientTicketsPage
**Purpose**: Client support tickets

**Features**:
- Same as ArtistTicketsPage
- Subject field (title)
- Client-specific context

**Database Tables**:
- support_tickets
- ticket_responses

---

## Shop & Commerce

### Shop System

#### Product Management
- Product listings with images
- Categories and filters
- Pricing and inventory
- Product descriptions
- Featured products

#### Shopping Cart
- Add to cart
- Cart persistence (Supabase, not localStorage)
- Guest cart with login redirect
- Quantity management
- Cart total calculation

#### Checkout
- Customer information collection
- Address validation
- Phone number validation
- Field-level error highlighting (red borders)
- Error messages below fields
- Payment method selection
- Order confirmation
- Receipt generation

**Checkout Validation**:
- Name validation
- Email validation
- Phone validation (9+ digits)
- Address validation (for shipping)
- Card field validation (if card payment)
- Real-time error clearing on input

**Payment Methods**:
- M-Pesa: Makamesco/Nexus Pay STK Push
- Card: Testing mode (saves details, shows declined)
- Settings-controlled availability

**Database Tables**:
- products
- cart_items
- orders
- order_items
- payment_settings

---

## Payment Gateway

### M-Pesa Integration

#### Makamesco/Nexus Pay Service
**Purpose**: M-Pesa payment processing

**Features**:
- STK Push for mobile payments
- B2C disbursements
- Transaction status checking
- Webhook handling
- Transaction logging

**Database Tables**:
- makamesco_transactions
- payment_settings

**API Endpoints**:
- initiateMakamescoSTKPush
- checkMakamescoStatus
- processMakamescoB2C

**Configuration**:
- Public key (VITE_MAKAMESCO_PUBLIC_KEY)
- Secret key (VITE_MAKAMESCO_SECRET_KEY)
- Payment settings in database

### Card Payments

#### Card Payment (Testing Mode)
**Purpose**: Card payment testing implementation

**Features**:
- Card details collection
- Card type detection (Visa, Mastercard)
- Expiry date validation
- CVV validation
- Save card details for testing
- Simulate processing
- Show "Card declined" message

**Database Tables**:
- orders
- card_attempts (if exists)

**Card Fields**:
- Cardholder name
- Card number
- Expiry month/year
- CVV
- Card brand

**Note**: This is testing implementation only. Real card payment integration pending.

**Payment Logos**:
- M-Pesa: /mpesa2.jpg
- Card: /visa-and-mastercard-logo-featuring-overlapping-circles-on-a-white-background-free-vector.jpg

---

## Email Service

### Email Configuration

#### EmailService
**Purpose**: Email sending service

**Features**:
- Resend API integration
- SMTP fallback
- Email templates
- Bulk email sending
- Delivery tracking
- Template variables

**Database Tables**:
- email_settings

**Email Templates**:
- Team invitations
- Password reset
- OTP codes
- Order confirmations
- Subscription confirmations
- Ticket notifications
- Welcome emails

**Configuration**:
- Resend API key (VITE_RESEND_API_KEY)
- SMTP settings (host, port, username, password)
- Sender name and email
- Reply-to address

**Admin Interface**:
- AdminEmailSettingsPage for configuration
- Email testing
- Template editing
- Delivery logs

---

## SEO & CMS

### Content Management

#### AdminCMSPage
**Purpose**: Page content management

**Features**:
- Rich text editor
- Page creation/editing
- Media library
- SEO configuration
- Publishing workflow
- Page templates

**Database Tables**:
- cms_pages
- cms_assets
- seo_settings

### SEO Management

#### AdminSEOPage
**Purpose**: Global SEO settings

**Features**:
- Site-wide meta tags
- Default titles/descriptions
- Open Graph tags
- Twitter cards
- Sitemap generation
- Robots.txt
- Canonical URLs
- Structured data

**Database Tables**:
- seo_settings
- settings

#### AdminSEOCMSPage
**Purpose**: Page-specific SEO

**Features**:
- Per-page meta tags
- Custom titles/descriptions
- Social media previews
- Image alt text
- URL slug management

**Database Tables**:
- seo_settings
- cms_pages

---

## Deployment

### VPS Deployment

#### Server Configuration
- **OS**: Ubuntu
- **Web Server**: Nginx
- **Process Manager**: PM2
- **SSL**: Let's Encrypt
- **Domain**: smartgigs.oneplusafrica.com

#### Deployment Process
1. SSH into server
2. Pull latest code from GitHub
3. Install dependencies
4. Build application (npm run build)
5. Restart PM2 process
6. Restart Nginx

#### PM2 Configuration
- App name: smartgigs
- Start command: npm start
- Auto-restart enabled
- Log management

#### Nginx Configuration
- Reverse proxy to Node.js app
- SSL/TLS configuration
- Static file serving
- Gzip compression
- Security headers

### Environment Setup

#### Required Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAKAMESCO_PUBLIC_KEY=your_makamesco_public_key (optional)
VITE_MAKAMESCO_SECRET_KEY=your_makamesco_secret_key (optional)
VITE_RESEND_API_KEY=your_resend_api_key (optional)
```

#### Environment Files
- `.env` - Local development
- `.env.production` - Production
- `.env.example` - Template

---

## Environment Configuration

### Supabase Configuration

#### Required Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key

#### Optional Variables
- `VITE_MAKAMESCO_PUBLIC_KEY` - Makamesco public key
- `VITE_MAKAMESCO_SECRET_KEY` - Makamesco secret key
- `VITE_RESEND_API_KEY` - Resend API key

### Application Settings

#### Feature Flags
- Actors portal enabled/disabled
- Crew portal enabled/disabled
- Maintenance mode
- Registration open/closed

#### Database Settings
- Connection pooling
- Query timeout
- Retry configuration

---

## Required SQL Migrations

### Migration List

#### 1. API Settings Schema
**File**: `database/migrations/create_api_settings_schema.sql`

**Purpose**: Create API configuration tables

**Tables Created**:
- api_configuration
- rate_limiting_settings
- integrations_settings
- api_keys
- api_usage_logs

**Fixes**: 404 errors for API settings pages

#### 2. Tickets Tables
**File**: `database/migrations/create_tickets_tables_with_policies.sql`

**Purpose**: Create support ticket system

**Tables Created**:
- support_tickets
- ticket_responses

**Features**:
- RLS policies for users and admins
- Indexes for performance
- Status and priority fields

#### 3. Auth Providers RLS
**File**: `database/migrations/add_auth_providers_rls.sql`

**Purpose**: Fix auth providers permissions

**Features**:
- RLS policies for auth_providers table
- Admin management access
- 403 error fix

#### 4. Messages Attachment
**File**: `database/migrations/add_attachment_to_messages.sql`

**Purpose**: Add attachment support to messages

**Changes**:
- Adds attachment JSONB column to messages
- Structure: { url, type, name, size }
- Fixes message sending with attachments

#### 5. Messages RLS
**File**: `database/migrations/remove_messages_rls.sql`

**Purpose**: Fix messaging permissions

**Changes**:
- Removes restrictive RLS policies
- Creates permissive policies for authenticated users
- Allows users to send messages without errors

#### 6. Applied Role
**File**: `database/migrations/add_applied_role_to_applications.sql`

**Purpose**: Track production role applications

**Changes**:
- Adds applied_role TEXT column to job_applications
- Index for faster queries
- Enables role-specific application tracking

### How to Run Migrations

1. Log in to Supabase dashboard
2. Go to SQL Editor
3. Open each migration file
4. Execute the SQL
5. Verify table creation
6. Check RLS policies

---

## Troubleshooting

### Common Issues

#### Build Errors
- **Issue**: JSX syntax errors
- **Solution**: Check for unclosed tags, mismatched braces
- **Common**: AdminAPISettingsPage, ArtistJobsPage

#### Database Errors
- **Issue**: Column not found errors
- **Solution**: Run required SQL migrations
- **Check**: Schema in Supabase vs code expectations

#### Authentication Errors
- **Issue**: 403 Forbidden on auth providers
- **Solution**: Run add_auth_providers_rls.sql migration

#### Messaging Errors
- **Issue**: Could not find attachment column
- **Solution**: Run add_attachment_to_messages.sql migration
- **RLS Issues**: Run remove_messages_rls.sql migration

#### Application Errors
- **Issue**: Could not find applied_role column
- **Solution**: Run add_applied_role_to_applications.sql migration

#### Payment Errors
- **Issue**: M-Pesa STK Push failures
- **Solution**: Check Makamesco API keys, test credentials
- **Card**: Card declines are expected in testing mode

#### Deployment Issues
- **Issue**: Domain showing default page
- **Solution**: Check Nginx status, restart if needed
- **PM2**: Ensure app is running, restart if stopped

#### Performance Issues
- **Issue**: Slow page loads
- **Solution**: Check database indexes, optimize queries
- **Storage**: Check storage bucket policies

### Debug Mode

#### Enable Debug Logging
- Check browser console for errors
- Check PM2 logs: `pm2 logs smartgigs`
- Check Nginx error logs
- Enable Vite detailed logging (remove logLevel: 'error')

### Support Resources

#### Documentation
- AGENTS.md - Development setup
- DEPLOYMENT.md - Deployment guides
- REQUIRED_SQL_MIGRATIONS.md - Migration list

#### Contact
- Admin support tickets
- Email support (if configured)
- GitHub issues (for code issues)

---

## Module Quick Reference

### Admin Module Pages (60+)
- Dashboard & Analytics (3)
- User Management (4)
- Artist Management (2)
- Client Management (1)
- Team Management (3)
- Backer Management (1)
- Job Management (2)
- Content Management (5)
- Commerce Management (4)
- Subscription Management (3)
- Payment Management (4)
- Messaging (1)
- Support (1)
- Settings (8)
- Content & Features (5)
- Audit & Security (2)
- Integrations (2)
- Approval Queues (2)
- Work Approval (1)
- Recent Projects (1)
- API Documentation (1)

### Artist Module Pages
- Dashboard
- Profile
- Jobs
- Subscriptions (2)
- Finance (2)
- Support (1)

### Client Module Pages
- Dashboard
- Browse Talent
- Jobs
- Applications
- Messages
- Support
- Subscriptions
- Analytics

### Backer Module Pages
- Dashboard
- Projects
- Investments
- Investment Tiers
- Deals
- Updates
- Partners
- Profile
- Banking
- Analytics

### Shared Modules
- Jobs (ArtistJobsPage)
- Messages (MessagesPage)
- Network (NetworkPage)
- Support (Ticket pages)
- Shop (Checkout, Products)
- Auth (SignIn, SignUp)

---

## System Architecture Summary

### Data Flow
1. **User Action** → React Component
2. **Component** → Supabase Entity
3. **Entity** → Supabase Client
4. **Client** → Supabase Backend
5. **Backend** → PostgreSQL
6. **Response** → Component State
7. **State** → UI Update

### Security Layers
1. **Authentication**: Supabase Auth
2. **Authorization**: RoleGuard, RLS policies
3. **Validation**: Form validation, field checks
4. **Sanitization**: Input sanitization, XSS prevention
5. **Encryption**: SSL/TLS, Supabase encryption

### Performance Optimization
1. **Caching**: React Query caching
2. **Lazy Loading**: Route-based code splitting
3. **Image Optimization**: Lazy loading, thumbnails
4. **Database Indexing**: Proper indexes on queries
5. **CDN**: Supabase Storage CDN

### Monitoring
1. **Analytics**: User event tracking
2. **Audit Logs**: System activity logging
3. **Error Tracking**: Browser console, PM2 logs
4. **Performance**: Page load times, query performance

---

## Conclusion

This handover document provides a comprehensive overview of the SmartGigs Kenya system. Each module is documented with its purpose, features, database tables, and key workflows. The system is built on a modern stack with Supabase as the backend, React for the frontend, and comprehensive payment, email, and storage integrations.

For development and deployment, refer to:
- AGENTS.md for development setup
- DEPLOYMENT.md for deployment guides
- REQUIRED_SQL_MIGRATIONS.md for database setup

For ongoing maintenance:
- Run required SQL migrations in Supabase
- Monitor PM2 and Nginx status
- Keep dependencies updated
- Review audit logs regularly
- Test payment integrations

---

**Document Version**: 1.0
**Last Updated**: 2026-10-26
**System Version**: Live Production
**Domain**: smartgigs.oneplusafrica.com
**Repository**: https://github.com/arjan001/erick_project
