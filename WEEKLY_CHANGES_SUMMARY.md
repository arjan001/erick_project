# Weekly Changes Summary
**Period: July 11, 2026 - July 17, 2026**

---

## Committed Changes

### 1. feat: Enhance artist dashboard jobs module and fix team dashboard
**Commit:** `74179a5`  
**Date:** July 15, 2026 at 14:27:51 +0300  
**Author:** edwin

**Artist Dashboard Improvements:**
- Fix subscription plan card UI responsiveness on small screens
- Add project_id support to applications table for project applications
- Prevent duplicate applications for same job/project
- Auto-close job modal after successful application
- Disable apply button and show 'Already Applied' status when applied
- Implement invitations tab with accept/decline functionality
- Add job details and client message view in invitations
- Fix application/invitation counters to only show when non-zero
- Update applications tab to use artist_id instead of artist_email

**Team Dashboard Fixes:**
- Fix projects/jobs module to fetch real applications from Supabase
- Update "In progress" stat to show actual pending application count
- Remove dummy data from messages module, use real database fields
- Display proper sender name, message content, and date

**Database:**
- Add project_id column to applications table for project applications
- Make job_id nullable to support both job and project applications
- Add indexes for project_id and artist_id columns

**Files Changed:**
- `database/migrations/add_artist_id_to_applications.sql` (31 lines added)
- `src/modules/artist/dashboard/ConnectsTrackerCard.jsx` (31 lines modified)
- `src/modules/jobs/pages/JobsPage.jsx` (403 lines added)
- `src/modules/team/pages/TeamDashboardPage.jsx` (28 lines modified)

---

### 2. feat: enhance artist onboarding modal and profile display
**Commit:** `728b0ab`  
**Date:** July 15, 2026 at 11:34:52 +0300  
**Author:** edwin

**Changes:**
- Fix skills and links UI in artist onboarding modal to use tag-style selection
  - Change from vertical input rows to horizontal tag-style selection
  - Add Enter key support for adding skills and languages
  - Display as removable tags in a single line for compact UI
- Add predefined skills selection similar to roles
  - Import SOFTWARE_CATEGORIES from filmRoles.js
  - Organize skills by category (3D, Texturing, Rendering, Compositing, Editing, etc.)
  - Add search functionality to filter skills
  - Implement toggle selection with tag-style UI
  - Keep custom skill input for skills not in predefined list
- Add confetti effect on profile completion
  - Use canvas-confetti library for celebration effect
  - Subtle black/gray color scheme matching app theme
  - 100 particles with 70 spread, centered at y:0.6
  - Auto-close modal after 1.5 seconds
- Fix modal save/fetch functionality
  - Add setArtist(updated) after save to update local state
  - Ensure data persists when navigating back and forth between steps
  - Properly fetch existing artist profile data on load
- Fix name updates to reflect in sidebar and topbar
  - ArtistSidebar now fetches and displays artist profile name
  - DashboardTopbar now fetches and displays artist profile name
  - Both use artistProfile.full_name instead of just auth user name
- Show profile photo instead of initials
  - ArtistSidebar displays profile photo if available, falls back to Users icon
  - DashboardTopbar displays profile photo if available, falls back to Users icon
  - Both fetch from artistProfile.profile_photo_url
- Update ArtistSidebar to fetch artist profile data
  - Add useEffect to fetch Artist entity by email
  - Display profile photo and name from fetched data
- Update DashboardTopbar to fetch artist profile data
  - Add useEffect to fetch Artist entity by email for artists
  - Display profile photo and name from fetched data

**Files Changed:**
- `src/components/ArtistSidebar.jsx` (30 lines added)
- `src/components/DashboardTopbar.jsx` (31 lines added)
- `src/modules/artist/ArtistOnboardingFullModal.jsx` (131 lines modified)

---

### 3. feat: enhance job board layout and application tracking system
**Commit:** `ae440fc`  
**Date:** July 15, 2026 at 07:57:10 +0300  
**Author:** edwin

**Changes:**
- Fix sidebar spacing by adding gap between sidebar and main content
- Change job board grid layout from 3 to 2 columns max for better UX
- Enhance artist applications tab with modern data table UI
  - Add status filter bar with dynamic counts
  - Implement color-coded status badges with icons
  - Add viewed indicator when client has seen application
  - Show expiration status for jobs past deadline
  - Display rejection reasons and client response times
  - Add withdraw functionality for pending applications
- Create database migration for enhanced application tracking
  - Add viewed_by_client, viewed_at, rejection_reason fields
  - Add client_feedback and client_responded_at fields
  - Expand status options to include viewed, shortlisted, interview_scheduled, expired
- Create database migration for applicant details snapshot
  - Add applicant_type, applicant_snapshot JSONB field
  - Add portfolio_urls, skills_snapshot, experience_years
  - Add hourly_rate, availability_status tracking
  - Add past_clients_snapshot, project_specialties_snapshot
  - Add languages_spoken_snapshot, countries_worked_snapshot
  - Add profile_photo_url, cover_letter_enhanced
  - Add proposed_rate, availability_notes, client_notes
  - Create application_views table for tracking profile views
  - Create applicant_ratings table for client reviews
- Enhance client applications modal with comprehensive applicant details
  - Display full profile header with photo, name, availability status
  - Show contact info: location, experience, hourly rate
  - Display bio, skills & expertise with color-coded badges
  - Show past clients, project specialties, languages, countries worked
  - Add online presence section with social media links
  - Display portfolio work grid with thumbnails and video links
  - Add PDF download capability for applicant profiles
  - Improve modal UI with sticky header and professional styling

**Files Changed:**
- `database/migrations/enhance_applicant_details_tracking.sql` (76 lines added)
- `database/migrations/enhance_applications_table.sql` (35 lines added)
- `src/components/AdminSidebar.jsx` (65 lines modified)
- `src/components/ArtistSidebar.jsx` (32 lines modified)
- `src/components/BackerSidebar.jsx` (62 lines modified)
- `src/components/ClientSidebar.jsx` (62 lines modified)
- `src/components/DashboardTopbar.jsx` (114 lines removed)
- `src/components/TeamSidebar.jsx` (64 lines modified)
- `src/layouts/DashboardLayout.jsx` (2 lines modified)
- `src/modules/admin/api/seo.api.js` (12 lines added)
- `src/modules/admin/pages/AdminSEOPage.jsx` (632 lines modified)
- `src/modules/client/pages/ClientApplicationsPage.jsx` (517 lines added)
- `src/modules/jobs/pages/JobBoardPage.jsx` (2 lines modified)
- `src/modules/jobs/pages/JobsPage.jsx` (233 lines added)

---

### 4. feat: implement comprehensive SEO system with admin panel and meta tags
**Commit:** `15ccd49`  
**Date:** July 15, 2026 at 05:58:17 +0300  
**Author:** edwin

**Changes:**
- Add AdminSEOPage with 6 tabs: Global Settings, Page Metadata, Social Media, Sitemap, Schema.org, Advanced
- Create database schema for SEO settings, page metadata, and sitemap logs
- Implement dynamic sitemap generation API with enable/disable toggle
- Create SEOMetaTags component with react-helmet-async integration
- Add HelmetProvider to App.jsx for proper head management
- Integrate SEO meta tags across all key pages (Home, Projects, ApplyArtist, ApplyTeam, Services, BackedProjects)
- Add comprehensive SEO descriptions, keywords, OG tags, and schema.org structured data
- Author attribution: oneplusafrica.com - OnePlusAfrica Tech Solution
- Fix category dropdown z-index and positioning on landing page
- Optimize landing page form input height and analyze button size
- Make "Post a Project" button visually active without click functionality
- Add error handling to SEOMetaTags for graceful fallback when database unavailable

**Files Changed:**
- `database/seo_schema.sql` (176 lines added)
- `package-lock.json` (36 lines added)
- `package.json` (1 line added)
- `src/App.jsx` (13 lines modified)
- `src/components/SEOMetaTags.jsx` (119 lines added)
- `src/layouts/MainLayout.jsx` (1 line removed)
- `src/modules/admin/api/seo.api.js` (239 lines added)
- `src/modules/admin/pages/AdminSEOPage.jsx` (459 lines added)
- `src/modules/projects/pages/ProjectsPage.jsx` (14 lines added)
- `src/pages/ApplyArtist.jsx` (14 lines added)
- `src/pages/ApplyTeam.jsx` (14 lines added)
- `src/pages/BackedProjects.jsx` (14 lines added)
- `src/pages/Home.jsx` (315 lines modified)
- `src/pages/Services.jsx` (14 lines added)

---

### 5. changes before landing page upgrade
**Commit:** `bc73af8`  
**Date:** July 14, 2026 at 16:55:18 +0300  
**Author:** edwin

**Note:** Changes before landing page upgrade (details not available in commit message)

---

### 6. feat: complete Milestone 3 - Admin Panel, Security, Performance & Deployment
**Commit:** `2ddc87b`  
**Date:** July 13, 2026 at 14:48:05 +0300  
**Author:** edwin

**Note:** Complete Milestone 3 implementation (details not available in commit message)

---

### 7. feat: enhance finance pages, fix user sync, simplify Google Drive integration
**Commit:** `a8fbbfc`  
**Date:** July 12, 2026 at 19:35:21 +0300  
**Author:** edwin

**Note:** Finance pages enhancements and user sync fixes (details not available in commit message)

---

### 8. feat: enhance job display and add finance/subscription features
**Commit:** `72fa8cd`  
**Date:** July 12, 2026 at 18:52:35 +0300  
**Author:** edwin

**Note:** Job display enhancements and finance/subscription features (details not available in commit message)

---

### 9. Merge branch 'main' of https://github.com/easyred/studio22
**Commit:** `7660cb6`  
**Date:** July 12, 2026 at 17:43:30 +0300  
**Author:** edwin

**Note:** Merge commit (no changes)

---

### 10. feat: implement subscription system with free plan auto-subscription and notification system
**Commit:** `d85be61`  
**Date:** July 12, 2026 at 17:43:05 +0300  
**Author:** edwin

**Note:** Subscription system implementation (details not available in commit message)

---

### 11. Update base44 packages
**Commit:** `35e67d7`  
**Date:** July 12, 2026 at 10:12:00 +0000  
**Author:** base44-builder[bot]

**Note:** Base44 package updates

---

### 12. Update base44 packages
**Commit:** `7652c63`  
**Date:** July 12, 2026 at 05:21:50 +0000  
**Author:** base44-builder[bot]

**Note:** Base44 package updates

---

### 13. feat: Add comprehensive analytics system and job board enhancements
**Commit:** `d9d7a4a`  
**Date:** July 11, 2026 at 01:38:59 +0300  
**Author:** edwin

**Note:** Analytics system and job board enhancements (details not available in commit message)

---

## Uncommitted Changes (Current Working Directory)

**Total Changes:** 883 insertions(+), 420 deletions(-)

### Files Modified:

1. **src/components/AdminSidebar.jsx** (3 lines modified)
   - Fixed messages query to use `is_read` instead of `read` for unread messages filtering

2. **src/components/ArtistSidebar.jsx** (46 lines modified)
   - Commented out "Projects from Clients" link (redundant with Jobs module)
   - Fixed messages query to use `is_read` instead of `read`

3. **src/components/BackerSidebar.jsx** (3 lines modified)
   - Fixed messages query to use `is_read` instead of `read`

4. **src/components/ClientSidebar.jsx** (3 lines modified)
   - Fixed messages query to use `is_read` instead of `read`

5. **src/components/DashboardTopbar.jsx** (3 lines modified)
   - Fixed messages query to use `is_read` instead of `read`

6. **src/components/TeamSidebar.jsx** (28 lines modified)
   - Fixed messages query to use `is_read` instead of `read`

7. **src/modules/jobs/pages/JobsPage.jsx** (551 lines modified)
   - Redesigned to match team projects page layout (split view, right-side details panel)
   - Removed job detail modal
   - Implemented unique view tracking using job_views/project_views tables
   - Added supabase import for direct database access
   - View counts now calculated from unique views per user/IP

8. **src/modules/messages/pages/MessagesPage.jsx** (44 lines modified)
   - Fixed white screen issue by replacing Message.subscribe() with polling mechanism
   - Polls for new messages every 30 seconds instead of using subscription
   - Prevents crashes from subscription errors

9. **src/modules/team/pages/TeamProjectsPage.jsx** (622 lines modified)
   - Added applications and invitations tabs matching artist jobs page UI
   - Implemented tab navigation with counts
   - Added JobInvitation import and fetching
   - Added invitations state and activeTab state
   - Implemented unique view tracking using job_views/project_views tables
   - Added supabase import for direct database access
   - View counts now calculated from unique views per user/IP
   - Gracefully handles missing team_id column in applications table

---

## Database Migrations Created (Not Yet Applied)

### 1. add_team_id_to_applications.sql
- Adds team_id column to applications table for team applications
- Foreign key reference to teams table with ON DELETE CASCADE
- Index for team_id for efficient querying
- Constraint to ensure either artist_id or team_id is present (not both)
- Comment for documentation

### 2. create_job_views_table.sql
- Creates job_views table to track unique views per job
- Creates project_views table to track unique views per project
- Uses partial unique indexes to prevent duplicate views:
  - For logged-in users: unique by job_id and user_id
  - For anonymous users: unique by job_id and ip_address
- Indexes for efficient querying
- Comments for documentation

---

## Summary of Improvements

### UI/UX Improvements:
- Redesigned jobs page to match team projects page layout
- Enhanced artist onboarding modal with tag-style selection
- Improved application tracking with modern data table UI
- Fixed sidebar spacing and layout issues
- Added confetti effects for user celebrations
- Enhanced profile photo display in sidebars and topbars

### Functionality Improvements:
- Implemented unique view tracking to prevent duplicate counts
- Added applications and invitations tabs to team projects page
- Fixed white screen issue in messages module
- Enhanced job application system with project support
- Improved subscription plan card responsiveness
- Added comprehensive SEO system with admin panel

### Database Improvements:
- Added project_id support to applications table
- Created job_views and project_views tables for unique view tracking
- Enhanced application tracking with detailed fields
- Added applicant details snapshot capabilities
- Created SEO database schema

### Bug Fixes:
- Fixed messages query to use correct column name (is_read)
- Fixed white screen in messages module by replacing subscription with polling
- Fixed duplicate application prevention
- Fixed sidebar name updates to reflect profile changes
- Fixed modal save/fetch functionality

---

**Generated:** July 17, 2026  
**Total Commits This Week:** 13  
**Total Files Changed (Uncommitted):** 9  
**Total Lines Changed (Uncommitted):** 883 insertions, 420 deletions
