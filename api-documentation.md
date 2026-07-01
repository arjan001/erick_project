# Studio22 API Documentation

**Version**: 1.0  
**Last Updated**: July 1, 2026  
**Base URL**: `https://your-supabase-project.supabase.co`  
**Database**: Supabase PostgreSQL  

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Artist API](#artist-api)
4. [Client API](#client-api)
5. [Team API](#team-api)
6. [Backer API](#backer-api)
7. [Admin API](#admin-api)
8. [Entity Models](#entity-models)
9. [Real-time Subscriptions](#real-time-subscriptions)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)

---

## Overview

Studio22 uses **Supabase** as its backend database and authentication provider. The API layer provides a unified interface for interacting with the database through entity abstractions that maintain compatibility with the previous Base44 architecture.

### Technology Stack

- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (PostgreSQL changes)
- **Storage**: Supabase Storage (buckets for files)
- **Client SDK**: @supabase/supabase-js v2.109.0

### API Pattern

All entity APIs follow a consistent pattern:

```javascript
{
  list(sort?, limit?)           // List all records
  filter(filters, sort?, limit?) // Filter records
  get(id)                       // Get single record by ID
  create(data)                   // Create new record
  update(id, data)              // Update existing record
  delete(id)                    // Delete record
  subscribe(callback)           // Real-time subscription
}
```

### Filter Operators

Filters support the following operators:

```javascript
{
  field: value              // Exact match
  field: { $gte: value }    // Greater than or equal
  field: { $lte: value }    // Less than or equal
  field: { $gt: value }     // Greater than
  field: { $lt: value }     // Less than
}
```

### Sorting

- Prefix with `-` for descending order: `'-created_at'`
- No prefix for ascending order: `'created_at'`

---

## Authentication

### Configuration

```javascript
import { supabase } from '@/lib/supabase';

// Environment variables required:
// VITE_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY
```

### Demo Authentication (Development)

**Note**: The current implementation uses demo authentication for development. Production should use Supabase Auth.

```javascript
import { authApi } from '@/modules/auth/api/auth.api';

// Login
const result = await authApi.login({
  email: 'artist@artist.com',
  password: 'artist@artist.com'
});

// Demo accounts:
// artist@artist.com (role: artist)
// team@team.com (role: team)
// client@client.com (role: client)
// project@project.com (role: project_owner)
// backer@backer.com (role: backer)
// admin@studio22.com (role: admin)

// Logout
authApi.logout();

// Get current session
const session = await authApi.getSession();
```

### Supabase Auth (Production)

```javascript
import { supabase } from '@/lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// OAuth providers
await supabase.auth.signInWithOAuth({
  provider: 'google' // or 'github', 'facebook', 'linkedin', 'twitter'
});
```

### User Roles

- `admin` - Full system access
- `artist` - Creator profile
- `artist_admin` - Artist with admin privileges
- `team` - Production team
- `team_admin` - Team with admin privileges
- `client` / `project_owner` - Client posting projects
- `project_admin` - Client with admin privileges
- `backer` - Investor/sponsor

---

## Artist API

### Module

```javascript
import { artistApi } from '@/modules/artist/api/artist.api';
```

### Endpoints

#### Get Current Artist Profile

```javascript
const artist = await artistApi.getCurrentArtist();
// Returns: Artist object or null
```

#### Get Artist by ID

```javascript
const artist = await artistApi.getArtistById(artistId);
// Returns: Artist object or null
```

#### List All Artists (Admin)

```javascript
const artists = await artistApi.listArtists({
  status: 'approved',
  availability_status: 'available'
});
// Returns: Array of Artist objects
```

#### Create Artist Profile

```javascript
const newArtist = await artistApi.createArtist({
  display_name: 'Alex Chen',
  stage_name: 'Visual Director',
  skills: ['cinematography', 'editing', 'color_grading'],
  years_experience: 5,
  hourly_rate: 75,
  availability_status: 'available',
  social_media_url: 'https://instagram.com/alexchen',
  website_url: 'https://alexchen.com'
});
```

#### Update Artist Profile

```javascript
const updated = await artistApi.updateArtist(artistId, {
  display_name: 'Alex Chen Jr.',
  hourly_rate: 85,
  availability_status: 'busy'
});
```

#### Update Current Artist Profile

```javascript
const updated = await artistApi.updateCurrentArtist({
  bio: 'Updated bio text',
  skills: ['cinematography', 'editing', 'vfx']
});
```

#### Delete Artist Profile

```javascript
await artistApi.deleteArtist(artistId);
```

#### Approve Artist (Admin)

```javascript
await artistApi.approveArtist(artistId);
```

#### Reject Artist (Admin)

```javascript
await artistApi.rejectArtist(artistId);
```

### Portfolio Clips

#### Add Portfolio Clip

```javascript
const clip = await artistApi.addPortfolioClip(artistId, {
  title: 'Brand Commercial 2024',
  description: '30-second commercial for XYZ brand',
  video_url: 'https://storage.example.com/video.mp4',
  thumbnail_url: 'https://storage.example.com/thumb.jpg',
  project_name: 'XYZ Brand Campaign',
  role: 'Director of Photography',
  duration_seconds: 30,
  is_featured: true,
  display_order: 0
});
```

#### Update Portfolio Clip

```javascript
const updated = await artistApi.updatePortfolioClip(clipId, {
  title: 'Updated Title',
  is_featured: false
});
```

#### Delete Portfolio Clip

```javascript
await artistApi.deletePortfolioClip(clipId);
```

#### Get Portfolio Clips

```javascript
const clips = await artistApi.getPortfolioClips(artistId);
// Returns: Array of portfolio clips
```

---

## Client API

### Module

```javascript
import { clientApi } from '@/modules/client/api/client.api';
```

### Endpoints

#### Get Current Client Profile

```javascript
const client = await clientApi.getCurrentClient();
// Returns: ProjectOwner object or null
```

#### Get Client by ID

```javascript
const client = await clientApi.getClientById(clientId);
```

#### Create Client Profile

```javascript
const newClient = await clientApi.createClient({
  company_name: 'Acme Productions',
  industry: 'Advertising',
  company_size: '50-100',
  budget_range: '$10,000-$50,000',
  website_url: 'https://acmeproductions.com'
});
```

#### Update Client Profile

```javascript
const updated = await clientApi.updateClient(clientId, {
  company_name: 'Acme Productions LLC',
  budget_range: '$50,000-$100,000'
});
```

#### Update Current Client Profile

```javascript
const updated = await clientApi.updateCurrentClient({
  industry: 'Entertainment',
  website_url: 'https://acme-entertainment.com'
});
```

#### Delete Client Profile

```javascript
await clientApi.deleteClient(clientId);
```

### Projects

#### Get Client Projects

```javascript
const projects = await clientApi.getProjects(clientId);
```

#### Get Current Client Projects

```javascript
const projects = await clientApi.getCurrentProjects();
```

#### Create Project

```javascript
const newProject = await clientApi.createProject({
  title: 'Summer Campaign 2024',
  description: 'Full campaign production for summer product launch',
  project_type: 'commercial',
  budget: 25000,
  location: 'Los Angeles, CA',
  start_date: '2024-07-01',
  end_date: '2024-08-15'
});
```

#### Update Project

```javascript
const updated = await clientApi.updateProject(projectId, {
  status: 'in_production',
  budget: 30000
});
```

#### Delete Project

```javascript
await clientApi.deleteProject(projectId);
```

---

## Team API

### Module

```javascript
import { teamApi } from '@/modules/team/api/team.api';
```

### Endpoints

#### Get Current Team Profile

```javascript
const team = await teamApi.getCurrentTeam();
// Returns: Team object or null
```

#### Get Team by ID

```javascript
const team = await teamApi.getTeamById(teamId);
```

#### List All Teams (Admin)

```javascript
const teams = await teamApi.listTeams({
  status: 'approved',
  specialties: ['commercial', 'documentary']
});
```

#### Create Team Profile

```javascript
const newTeam = await teamApi.createTeam({
  team_name: 'Visionary Studios',
  specialties: ['commercial', 'music_video', 'documentary'],
  hourly_rate: 150,
  availability_status: 'available',
  website_url: 'https://visionarystudios.com',
  social_media_url: 'https://instagram.com/visionarystudios'
});
```

#### Update Team Profile

```javascript
const updated = await teamApi.updateTeam(teamId, {
  team_name: 'Visionary Studios LLC',
  hourly_rate: 175
});
```

#### Update Current Team Profile

```javascript
const updated = await teamApi.updateCurrentTeam({
  specialties: ['commercial', 'music_video', 'feature_film']
});
```

#### Delete Team Profile

```javascript
await teamApi.deleteTeam(teamId);
```

#### Approve Team (Admin)

```javascript
await teamApi.approveTeam(teamId);
```

#### Reject Team (Admin)

```javascript
await teamApi.rejectTeam(teamId);
```

#### Suspend Team (Admin)

```javascript
await teamApi.suspendTeam(teamId, 'Violation of terms');
```

#### Unsuspend Team (Admin)

```javascript
await teamApi.unsuspendTeam(teamId);
```

### Team Logo

#### Upload Team Logo

```javascript
const logoUrl = await teamApi.uploadTeamLogo(file);
// Returns: URL of uploaded logo
```

### Portfolio Clips

#### Add Portfolio Clip

```javascript
const clip = await teamApi.addPortfolioClip(teamId, {
  title: 'Music Video Production',
  description: 'Full production for artist music video',
  video_url: 'https://storage.example.com/video.mp4',
  thumbnail_url: 'https://storage.example.com/thumb.jpg',
  project_name: 'Artist Name - Song Title',
  role: 'Production Team',
  duration_seconds: 240
});
```

#### Update Portfolio Clip

```javascript
const updated = await teamApi.updatePortfolioClip(clipId, {
  title: 'Updated Title'
});
```

#### Delete Portfolio Clip

```javascript
await teamApi.deletePortfolioClip(clipId);
```

#### Get Portfolio Clips

```javascript
const clips = await teamApi.getPortfolioClips(teamId);
```

### Team Members

#### Add Team Member

```javascript
const member = await teamApi.addTeamMember(teamId, {
  name: 'John Doe',
  role: 'Cinematographer',
  skills: ['camera_operation', 'lighting'],
  avatar_url: 'https://storage.example.com/avatar.jpg'
});
```

#### Update Team Member

```javascript
const updated = await teamApi.updateTeamMember(memberId, {
  role: 'Director of Photography',
  skills: ['camera_operation', 'lighting', 'composition']
});
```

#### Remove Team Member

```javascript
await teamApi.removeTeamMember(memberId);
```

#### Get Team Members

```javascript
const members = await teamApi.getTeamMembers(teamId);
```

### Team Invitations

#### Create Invitation

```javascript
const invitation = await teamApi.createInvitation(teamId, {
  email: 'invitee@example.com',
  member_name: 'Jane Smith',
  member_role: 'Editor',
  expires_at: '2024-08-01T00:00:00Z'
});
```

#### Update Invitation

```javascript
const updated = await teamApi.updateInvitation(invitationId, {
  status: 'accepted'
});
```

#### Cancel Invitation

```javascript
await teamApi.cancelInvitation(invitationId);
```

#### Get Invitations

```javascript
const invitations = await teamApi.getInvitations(teamId);
```

### Tasks

#### Create Task

```javascript
const task = await teamApi.createTask(teamId, {
  title: 'Edit rough cut',
  description: 'Complete first edit of project footage',
  due_date: '2024-07-15',
  priority: 'high',
  assigned_to: 'member_id'
});
```

#### Update Task

```javascript
const updated = await teamApi.updateTask(taskId, {
  status: 'in_progress',
  priority: 'medium'
});
```

#### Delete Task

```javascript
await teamApi.deleteTask(taskId);
```

#### Get Tasks

```javascript
const tasks = await teamApi.getTasks(teamId);
```

### Payments

#### Create Payment

```javascript
const payment = await teamApi.createPayment(teamId, {
  amount: 5000,
  payment_method: 'bank_transfer',
  description: 'Project milestone payment',
  due_date: '2024-07-30'
});
```

#### Update Payment

```javascript
const updated = await teamApi.updatePayment(paymentId, {
  status: 'paid',
  paid_date: '2024-07-28'
});
```

#### Delete Payment

```javascript
await teamApi.deletePayment(paymentId);
```

#### Get Payments

```javascript
const payments = await teamApi.getPayments(teamId);
```

---

## Backer API

### Module

```javascript
import { backerApi } from '@/modules/backer/api/backer.api';
```

### Endpoints

#### Get Current Backer Profile

```javascript
const backer = await backerApi.getCurrentBacker();
// Returns: Backer object or null
```

#### Get Backer by ID

```javascript
const backer = await backerApi.getBackerById(backerId);
```

#### Create Backer Profile

```javascript
const newBacker = await backerApi.createBacker({
  organization_name: 'Venture Capital Partners',
  investment_focus: ['Film', 'Technology', 'Media'],
  website_url: 'https://vcpartners.com',
  social_media_url: 'https://linkedin.com/company/vcpartners',
  bio: 'Leading venture capital firm focused on creative industries'
});
```

#### Update Backer Profile

```javascript
const updated = await backerApi.updateBacker(backerId, {
  investment_focus: ['Film', 'Technology', 'Media', 'Gaming'],
  bio: 'Investing in the future of entertainment'
});
```

#### Update Current Backer Profile

```javascript
const updated = await backerApi.updateCurrentBacker({
  organization_name: 'VC Partners LLC'
});
```

#### Delete Backer Profile

```javascript
await backerApi.deleteBacker(backerId);
```

### Backed Projects

#### Create Backed Project

```javascript
const backedProject = await backerApi.createBackedProject({
  project_id: projectId,
  project_title: 'Indie Film Project',
  investment_amount: 50000,
  notes: 'Promising director with strong track record'
});
// Automatically updates backer totals
```

#### Update Backed Project

```javascript
const updated = await backerApi.updateBackedProject(projectId, {
  status: 'completed',
  notes: 'Project successfully completed'
});
```

#### Delete Backed Project

```javascript
await backerApi.deleteBackedProject(projectId);
// Automatically updates backer totals
```

#### Get Backed Projects

```javascript
const projects = await backerApi.getBackedProjects();
```

### Deals

#### Create Deal

```javascript
const deal = await backerApi.createDeal({
  title: 'Film Fund Round A',
  amount: 1000000,
  description: 'Series A funding for film production fund',
  status: 'pending'
});
```

#### Update Deal

```javascript
const updated = await backerApi.updateDeal(dealId, {
  status: 'negotiating',
  amount: 1200000
});
```

#### Delete Deal

```javascript
await backerApi.deleteDeal(dealId);
```

#### Get Deals

```javascript
const deals = await backerApi.getDeals();
```

### Project Browsing

#### Get All Projects

```javascript
const projects = await backerApi.getAllProjects({
  status: 'submitted',
  project_type: 'film'
});
```

#### Get Project by ID

```javascript
const project = await backerApi.getProjectById(projectId);
```

#### Back Project (One-Click)

```javascript
const backedProject = await backerApi.backProject(projectId, 25000);
// Creates backed project record and updates project funding
```

### Analytics

#### Get Investment Statistics

```javascript
const stats = await backerApi.getInvestmentStats();
// Returns:
// {
//   totalInvested: 250000,
//   totalExpectedROI: 287500,
//   totalROI: 37500,
//   roiPercentage: 15,
//   activeInvestments: 5,
//   completedInvestments: 3,
//   totalInvestments: 8
// }
```

---

## Admin API

### Module

```javascript
import { adminApi } from '@/modules/admin/api/admin.api';
```

### Projects

#### List All Projects

```javascript
const projects = await adminApi.projects.list();
```

#### Approve Project

```javascript
await adminApi.projects.approve(projectId);
// Sets status to 'verified'
```

#### Reject Project

```javascript
await adminApi.projects.reject(projectId);
// Sets status to 'rejected'
```

#### Enable Backing

```javascript
await adminApi.projects.enableBacking(projectId);
// Sets verified_only to false
```

### Artists

#### List All Artists

```javascript
const artists = await adminApi.artists.list('-created_date');
// Sort by created_date descending
```

#### Approve Artist

```javascript
await adminApi.artists.approve(artistId, 'Portfolio reviewed and approved');
// Sets status to 'approved' with admin notes
```

#### Reject Artist

```javascript
await adminApi.artists.reject(artistId, 'Portfolio does not meet quality standards');
// Sets status to 'rejected' with admin notes
```

### Teams

#### List All Teams

```javascript
const teams = await adminApi.teams.list('-created_date');
```

#### Approve Team

```javascript
await adminApi.teams.approve(teamId, 'Team verified and approved');
```

#### Reject Team

```javascript
await adminApi.teams.reject(teamId, 'Incomplete team information');
```

#### Suspend Team

```javascript
await adminApi.teams.suspend(teamId, 'Policy violation');
```

#### Unsuspend Team

```javascript
await adminApi.teams.unsuspend(teamId);
```

#### Remove Team

```javascript
await adminApi.teams.remove(teamId);
```

### Ticker Entries (Landing Page Banner)

#### List Ticker Entries

```javascript
const entries = await adminApi.ticker.list();
```

#### Create Ticker Entry

```javascript
const entry = await adminApi.ticker.create({
  text: 'New feature launched: Video calls now available!',
  link_url: '/features/video-calls',
  is_active: true,
  display_order: 0
});
```

#### Update Ticker Entry

```javascript
const updated = await adminApi.ticker.update(entryId, {
  text: 'Updated announcement text',
  is_active: false
});
```

#### Delete Ticker Entry

```javascript
await adminApi.ticker.delete(entryId);
```

---

## Entity Models

### Supabase Entity Abstraction

All entities are accessed through the unified entity interface in `src/lib/supabaseEntities.js`:

```javascript
import { Job, Project, Application, JobInvitation } from '@/lib/supabaseEntities';
```

### Available Entities

- `Job` - Job postings
- `Project` - Client projects
- `Application` - Job/project applications
- `JobInvitation` - Client invitations to artists
- `SubscriptionOrder` - Subscription payment records
- `Artist` - Artist profiles
- `Backer` - Backer profiles
- `ProjectOwner` - Client profiles
- `Message` - Messages
- `Notification` - System notifications
- `Connection` - User connections
- `PortfolioClip` - Portfolio items
- `Endorsement` - Skill endorsements
- `Testimonial` - User reviews
- `Deal` - Backer deals
- `Partner` - Backer partners
- `InvestmentTier` - Investment tiers
- `ProjectUpdate` - Project updates
- `BackedProject` - Backed projects
- `ConnectsTransaction` - Connects transactions
- `RolePermission` - Role permissions
- `AuditLog` - Audit logs
- `TickerEntry` - Ticker entries
- `SubscriptionPackage` - Subscription packages
- `Subscription` - User subscriptions
- `Note` - Notes
- `SavedProject` - Saved projects
- `Assignment` - Assignments
- `Creator` - Creator profiles
- `Translation` - Translations
- `SystemSetting` - System settings
- `Team` - Team profiles
- `Invite` - Team invitations

### Entity Usage Example

```javascript
import { Job } from '@/lib/supabaseEntities';

// List all jobs
const allJobs = await Job.list('-created_at', 50);

// Filter jobs
const openJobs = await Job.filter({ status: 'open' }, '-posted_at');

// Get single job
const job = await Job.get(jobId);

// Create job
const newJob = await Job.create({
  title: 'Video Editor Needed',
  description: 'Looking for experienced editor',
  client_email: 'client@example.com',
  status: 'open'
});

// Update job
const updated = await Job.update(jobId, { status: 'filled' });

// Delete job
await Job.delete(jobId);

// Real-time subscription
const unsubscribe = Job.subscribe((payload) => {
  console.log('Change detected:', payload);
  // payload: { id, type, data }
  // type: 'create' | 'update' | 'delete'
});

// Unsubscribe
unsubscribe();
```

---

## Real-time Subscriptions

### Subscribe to Entity Changes

All entities support real-time subscriptions using Supabase Realtime:

```javascript
import { Job, Application, Message } from '@/lib/supabaseEntities';

// Subscribe to job changes
const unsubscribeJobs = Job.subscribe((payload) => {
  const { id, type, data } = payload;
  console.log(`Job ${type}:`, data);
  
  if (type === 'create') {
    // Handle new job
  } else if (type === 'update') {
    // Handle job update
  } else if (type === 'delete') {
    // Handle job deletion
  }
});

// Subscribe to application changes
const unsubscribeApplications = Application.subscribe((payload) => {
  console.log('Application change:', payload);
});

// Subscribe to messages
const unsubscribeMessages = Message.subscribe((payload) => {
  console.log('New message:', payload);
});

// Unsubscribe when done
unsubscribeJobs();
unsubscribeApplications();
unsubscribeMessages();
```

### Subscription Payload Structure

```javascript
{
  id: "uuid",           // Record ID
  type: "create" | "update" | "delete",
  data: {
    // Record data (new for create/update, old for delete)
    id: "uuid",
    // ... other fields
    created_date: "2024-07-01T00:00:00Z"
  }
}
```

---

## Error Handling

### Standard Error Response

All API calls throw errors on failure. Handle them with try-catch:

```javascript
try {
  const artist = await artistApi.getCurrentArtist();
} catch (error) {
  console.error('Error fetching artist:', error);
  // Handle error
}
```

### Common Error Types

- `AuthError` - Authentication/authorization errors
- `NotFoundError` - Resource not found
- `ValidationError` - Invalid input data
- `RateLimitError` - Rate limit exceeded
- `DatabaseError` - Database operation failed

### Error Object Structure

```javascript
{
  message: "Error description",
  code: "ERROR_CODE",
  details: { /* Additional error details */ }
}
```

---

## Rate Limiting

### Current Implementation

Rate limiting is handled at the Supabase level. Configure limits in Supabase dashboard:

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **Admin**: 5000 requests per minute

### Custom Rate Limits

For custom rate limiting, implement in Supabase Edge Functions:

```javascript
// Example Edge Function with rate limiting
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const rateLimiter = new Map();

serve(async (req) => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // Clean old entries
  for (const [key, value] of rateLimiter.entries()) {
    if (now - value.timestamp > 60000) {
      rateLimiter.delete(key);
    }
  }
  
  // Check rate limit
  const userRequests = rateLimiter.get(ip) || { count: 0, timestamp: now };
  if (userRequests.count >= 100) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Increment counter
  rateLimiter.set(ip, { count: userRequests.count + 1, timestamp: now });
  
  // Process request
  // ...
});
```

---

## Storage Buckets

### Available Buckets

- `profile-photos` - User profile images
- `portfolio-clips` - Portfolio video clips
- `project-images` - Project images
- `team-logos` - Team logo images
- `backer-logos` - Backer organization logos
- `message-attachments` - Message file attachments
- `shop-images` - E-commerce product images

### Upload File

```javascript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.storage
  .from('portfolio-clips')
  .upload(`artist-${artistId}/${file.name}`, file);

if (error) {
  console.error('Upload error:', error);
} else {
  const publicUrl = supabase.storage
    .from('portfolio-clips')
    .getPublicUrl(data.path);
  console.log('File URL:', publicUrl.data.publicUrl);
}
```

### Delete File

```javascript
const { error } = await supabase.storage
  .from('portfolio-clips')
  .remove([`artist-${artistId}/${fileName}`]);
```

### List Files

```javascript
const { data, error } = await supabase.storage
  .from('portfolio-clips')
  .list(`artist-${artistId}`);
```

---

## Database Schema

### Core Tables

#### users
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `role` (VARCHAR) - admin, artist, team, client, project_owner, backer
- `avatar_url` (TEXT)
- `bio` (TEXT)
- `location` (VARCHAR)
- `country` (VARCHAR)
- `is_verified` (BOOLEAN)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### artists
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `display_name` (VARCHAR)
- `stage_name` (VARCHAR)
- `skills` (TEXT[])
- `years_experience` (INTEGER)
- `hourly_rate` (DECIMAL)
- `availability_status` (VARCHAR) - available, busy, unavailable
- `admin_approval_status` (VARCHAR) - pending, approved, rejected
- `social_media_url` (TEXT)
- `website_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### teams
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `team_name` (VARCHAR)
- `team_size` (INTEGER)
- `specialties` (TEXT[])
- `hourly_rate` (DECIMAL)
- `availability_status` (VARCHAR)
- `admin_approval_status` (VARCHAR)
- `logo_url` (TEXT)
- `website_url` (TEXT)
- `social_media_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### clients (project_owners)
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `company_name` (VARCHAR)
- `industry` (VARCHAR)
- `company_size` (VARCHAR)
- `budget_range` (VARCHAR)
- `website_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### backers
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `organization_name` (VARCHAR)
- `investment_focus` (TEXT[])
- `total_invested` (DECIMAL)
- `investment_count` (INTEGER)
- `website_url` (TEXT)
- `social_media_url` (TEXT)
- `bio` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### jobs
- `id` (UUID, PK)
- `title` (VARCHAR)
- `description` (TEXT)
- `client_email` (VARCHAR)
- `location` (VARCHAR)
- `budget_min` (DECIMAL)
- `budget_max` (DECIMAL)
- `budget_type` (VARCHAR) - fixed, hourly
- `roles_needed` (TEXT[])
- `skills_required` (TEXT[])
- `project_types` (TEXT[])
- `status` (VARCHAR) - open, closed, filled
- `posted_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### projects
- `id` (UUID, PK)
- `project_owner_email` (VARCHAR)
- `project_type` (VARCHAR) - commercial, short_film, film, music_video, documentary
- `location_city` (VARCHAR)
- `location_country` (VARCHAR)
- `timeline_start` (DATE)
- `timeline_deadline` (DATE)
- `budget_range` (VARCHAR)
- `notes` (TEXT)
- `image_url` (TEXT)
- `status` (VARCHAR) - submitted, verified, in_progress, delivered, rejected
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### applications
- `id` (UUID, PK)
- `job_id` (UUID, FK → jobs)
- `project_id` (UUID, FK → projects)
- `artist_email` (VARCHAR)
- `status` (VARCHAR) - applied, chat_started, shortlisted, hired, accepted, rejected
- `applied_at` (TIMESTAMP)
- `cover_letter` (TEXT)
- `created_at` (TIMESTAMP)

#### job_invitations
- `id` (UUID, PK)
- `job_id` (UUID, FK → jobs)
- `artist_email` (VARCHAR)
- `client_email` (VARCHAR)
- `message` (TEXT)
- `status` (VARCHAR) - pending, accepted, declined, expired
- `sent_at` (TIMESTAMP)
- `responded_at` (TIMESTAMP)

#### portfolio_clips
- `id` (UUID, PK)
- `artist_id` (UUID, FK → artists)
- `team_id` (UUID, FK → teams)
- `title` (VARCHAR)
- `description` (TEXT)
- `video_url` (TEXT)
- `thumbnail_url` (TEXT)
- `project_name` (VARCHAR)
- `role` (VARCHAR)
- `duration_seconds` (INTEGER)
- `is_featured` (BOOLEAN)
- `display_order` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### messages
- `id` (UUID, PK)
- `conversation_id` (UUID, FK → conversations)
- `sender_id` (UUID, FK → users)
- `content` (TEXT)
- `is_read` (BOOLEAN)
- `read_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

#### notifications
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `type` (VARCHAR) - job_application, job_invitation, connection_request, message, endorsement, testimonial, project_update, system
- `title` (VARCHAR)
- `content` (TEXT)
- `link_url` (TEXT)
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMP)

#### connections
- `id` (UUID, PK)
- `requester_id` (UUID, FK → users)
- `receiver_id` (UUID, FK → users)
- `status` (VARCHAR) - pending, accepted, rejected, blocked
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### endorsements
- `id` (UUID, PK)
- `endorser_id` (UUID, FK → users)
- `recipient_artist_id` (UUID, FK → artists)
- `recipient_team_id` (UUID, FK → teams)
- `skill` (VARCHAR)
- `rating` (INTEGER, 1-5)
- `comment` (TEXT)
- `created_at` (TIMESTAMP)

#### testimonials
- `id` (UUID, PK)
- `author_id` (UUID, FK → users)
- `recipient_artist_id` (UUID, FK → artists)
- `recipient_team_id` (UUID, FK → teams)
- `project_id` (UUID, FK → projects)
- `rating` (INTEGER, 1-5)
- `title` (VARCHAR)
- `content` (TEXT)
- `is_verified` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Full Schema

For the complete database schema with all tables, indexes, triggers, and constraints, refer to:
- `DATABASE_SCHEMA.sql` - Production PostgreSQL schema
- `SUPABASE_MIGRATION.sql` - Supabase-specific migrations
- `SUPABASE_MIGRATION_MODULES.sql` - Additional module migrations

---

## Security Considerations

### Row Level Security (RLS)

All Supabase tables have RLS policies enabled. Current policies allow public access for development. For production:

1. **Enable strict RLS** - Remove "Public full access" policies
2. **Implement role-based policies** - Create policies based on user roles
3. **Use service-role client** - For admin operations in Edge Functions

### Example RLS Policy

```sql
-- Allow users to only see their own data
CREATE POLICY "Users can view own profile" 
ON artists 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to view all data
CREATE POLICY "Admins can view all" 
ON artists 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### API Key Security

- Never expose service-role keys in client-side code
- Use anon/public keys for browser operations
- Store sensitive keys in Supabase Edge Functions environment variables
- Rotate keys regularly

### Input Validation

Always validate input on both client and server:

```javascript
// Client-side validation
import { z } from 'zod';

const artistSchema = z.object({
  display_name: z.string().min(2).max(100),
  email: z.string().email(),
  hourly_rate: z.number().min(0).max(1000),
  skills: z.array(z.string()).min(1).max(20)
});

const validated = artistSchema.parse(inputData);
```

---

## Support

For issues or questions:

- **Documentation**: Check this document first
- **Database Schema**: Refer to SQL migration files
- **Code Examples**: Check module API files in `src/modules/*/api/`
- **Supabase Docs**: https://supabase.com/docs
- **React Query Docs**: https://tanstack.com/query/latest

---

**Document Version**: 1.0  
**Last Updated**: July 1, 2026  
**Maintained By**: Studio22 Development Team
