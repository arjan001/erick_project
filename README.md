# SmartGigs Kenya

**About**

SmartGigs Kenya is a creative production marketplace that connects film & video professionals with the people who need them. It brings together four kinds of members in one platform:

- **Creators** — directors, cinematographers, editors, VFX/3D artists, sound designers, actors, and other specialists who build a profile, showcase a portfolio, and apply to paid jobs.
- **Teams** — production studios and crews who register as a group, list their members, equipment, and portfolio, and take on larger jobs together.
- **Clients** — companies and individuals who post projects and jobs, browse creators/teams, and hire the right talent.
- **Backers** — sponsors, investors, and organizations who discover projects seeking funding, co-production, or cultural support, and connect with project owners.

Core features include: browsing and applying to jobs, in-app messaging between members, project submission and tracking, a "Backed Projects" discovery feed for funding opportunities, endorsements & testimonials between members, a full shop with auctions, a comprehensive admin panel for managing users, content, payments, and platform settings.

**Prerequisites:**

1. Clone the repository using the project's Git URL
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url
VITE_PUBLISHABLE_KEY=your_publishable_key

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

**Development**

Run the app: `npm run dev`

The development server will start on `http://localhost:5173`

**Build**

Build for production: `npm run build`

**Shop Features**

The shop includes:
- Product listings with categories (Wardrobe, Equipment, Merchandise, Collectibles, Experiences)
- Live auctions (time-based and count-based)
- Quick sale/purchase options
- Cart and checkout functionality
- Wishlist management
- Card payment capture (for testing)
- M-Pesa integration support

**Admin Panel**

The admin panel includes modules for:
- User Management (Creators, Teams, Clients, Backers)
- CMS (Page content management)
- Shop (Products, Orders, Card Payments, Shop Settings, Partners)
- Jobs (Featured jobs, job management)
- Newsletter & Mailing List
- Content & Communication (Articles, Messages, CMS)
- System (General Settings, Analytics, Finance Dashboard, Audit Logs)

**Database Schema**

A complete Supabase SQL schema is available in `database/supabase_schema.sql` covering:
- Users and role profiles
- Creators, clients, teams, backers
- Projects, jobs, applications
- Messaging
- Shop products, orders, payments, auctions
- Partners, CMS, newsletter subscriptions
- Audit logs and more

**Tech Stack**

- React with JSX
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Supabase (planned)
- Base44 SDK (current backend)

**Support**

For issues and questions, please refer to the project documentation or contact the development team.
