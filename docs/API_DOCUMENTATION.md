# Studio22 API Documentation

## Overview

Studio22 uses the Base44 API client for all backend operations. This document provides comprehensive information about the API structure, entities, and usage patterns.

## Base Configuration

### API Client Setup

```javascript
import { base44 } from '@/api/base44Client';
```

The Base44 client is configured to handle:
- Authentication via JWT tokens
- Automatic request/response handling
- Error management
- File uploads

## Authentication

### Login

```javascript
const { login } = useAuth();
await login(email, password);
```

### Logout

```javascript
const { logout } = useAuth();
await logout();
```

### Auth Context

```javascript
import { useAuth } from '@/lib/AuthContext';

const { user, isAuthenticated, loading } = useAuth();
```

## Entities

### User Entity

**Table:** `users`

**Fields:**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - User email address
- `password_hash` (VARCHAR) - Encrypted password
- `first_name` (VARCHAR) - User's first name
- `last_name` (VARCHAR) - User's last name
- `role` (VARCHAR) - User role (artist, client, backer, team, project_owner, admin)
- `team_id` (UUID) - Associated team ID (for team members)
- `created_at` (TIMESTAMP) - Account creation date
- `updated_at` (TIMESTAMP) - Last update date

**Operations:**
```javascript
// Create user
await base44.entities.User.create({
  email: 'user@example.com',
  password_hash: 'hashed_password',
  first_name: 'John',
  last_name: 'Doe',
  role: 'artist'
});

// Filter users
await base44.entities.User.filter({ email: 'user@example.com' });

// Update user
await base44.entities.User.update(userId, { first_name: 'Jane' });

// Delete user
await base44.entities.User.delete(userId);
```

### Artist Entity

**Table:** `artists`

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to users table
- `artist_name` (VARCHAR) - Display name
- `bio` (TEXT) - Artist biography
- `portfolio_url` (TEXT) - Portfolio website URL
- `hourly_rate` (DECIMAL) - Hourly rate
- `availability_status` (VARCHAR) - Current availability
- `skills` (TEXT[]) - Array of skills
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Artist } from '@/lib/supabaseEntities';

// Filter artists
await Artist.filter({ user_id: userId });

// Update artist
await Artist.update(artistId, { hourly_rate: 50 });
```

### Team Entity

**Table:** `teams`

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to users table
- `team_name` (VARCHAR) - Team name
- `contact_email` (VARCHAR) - Contact email
- `contact_name` (VARCHAR) - Contact person name
- `phone` (VARCHAR) - Phone number
- `city` (VARCHAR) - City location
- `country` (VARCHAR) - Country location
- `team_logo_url` (TEXT) - Team logo URL
- `bio` (TEXT) - Team description
- `admin_notes` (TEXT) - Admin notes
- `instagram` (TEXT) - Instagram URL
- `linkedin` (TEXT) - LinkedIn URL
- `team_members` (JSONB) - Team members array
- `status` (VARCHAR) - Team status
- `availability` (VARCHAR) - Availability status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Team } from '@/lib/supabaseEntities';

// Filter teams
await Team.filter({ contact_email: email });

// Update team
await Team.update(teamId, { team_name: 'New Name' });
```

### Client Entity

**Table:** `clients`

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to users table
- `company_name` (VARCHAR) - Company name
- `industry` (VARCHAR) - Industry sector
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Client } from '@/lib/supabaseEntities';

// Filter clients
await Client.filter({ user_id: userId });
```

### Backer Entity

**Table:** `backers`

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Reference to users table
- `organization_name` (VARCHAR) - Organization name
- `investment_focus` (TEXT[]) - Investment focus areas
- `total_invested` (DECIMAL) - Total amount invested
- `investment_count` (INTEGER) - Number of investments
- `website_url` (TEXT) - Website URL
- `social_media_url` (TEXT) - Social media URL
- `bio` (TEXT) - Backer biography
- `bank_accounts` (JSONB) - Bank account details
- `contact_email` (VARCHAR) - Contact email
- `city` (VARCHAR) - City location
- `country` (VARCHAR) - Country location
- `linkedin` (TEXT) - LinkedIn URL
- `instagram` (TEXT) - Instagram URL
- `twitter` (TEXT) - Twitter URL
- `youtube` (TEXT) - YouTube URL
- `email_notifications` (BOOLEAN) - Email notification preference
- `deal_alerts` (BOOLEAN) - Deal alert preference
- `profile_public` (BOOLEAN) - Profile visibility
- `logo_url` (TEXT) - Logo URL
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Backer } from '@/lib/supabaseEntities';

// Filter backers
await Backer.filter({ contact_email: email });

// Update backer
await Backer.update(backerId, { total_invested: 10000 });
```

### Project Entity

**Table:** `projects`

**Fields:**
- `id` (UUID) - Primary key
- `title` (VARCHAR) - Project title
- `description` (TEXT) - Project description
- `category` (VARCHAR) - Project category
- `funding_goal` (DECIMAL) - Funding goal amount
- `current_funding` (DECIMAL) - Current funding amount
- `status` (VARCHAR) - Project status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Project } from '@/lib/supabaseEntities';

// List projects
await Project.list();

// Filter projects
await Project.filter({ category: 'film' });
```

### BackedProject Entity

**Table:** `backed_projects`

**Fields:**
- `id` (UUID) - Primary key
- `backer_id` (UUID) - Reference to backers table
- `backer_email` (VARCHAR) - Backer email
- `project_id` (UUID) - Reference to projects table
- `project_title` (VARCHAR) - Project title
- `investment_amount` (DECIMAL) - Investment amount
- `expected_roi` (DECIMAL) - Expected return on investment
- `status` (VARCHAR) - Investment status
- `notes` (TEXT) - Investment notes
- `investment_date` (TIMESTAMP) - Investment date
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { BackedProject } from '@/lib/supabaseEntities';

// Create backed project
await BackedProject.create({
  backer_email: email,
  backer_id: backerId,
  project_title: 'Project Name',
  investment_amount: 5000,
  status: 'active'
});

// Filter backed projects
await BackedProject.filter({ backer_email: email });
```

### Deal Entity

**Table:** `deals`

**Fields:**
- `id` (UUID) - Primary key
- `backer_id` (UUID) - Reference to backers table
- `title` (VARCHAR) - Deal title
- `description` (TEXT) - Deal description
- `amount` (DECIMAL) - Deal amount
- `counterparty` (VARCHAR) - Counterparty name
- `status` (VARCHAR) - Deal status (pending, active, completed, cancelled)
- `start_date` (DATE) - Deal start date
- `end_date` (DATE) - Deal end date
- `document_url` (TEXT) - Document URL
- `signature_status` (VARCHAR) - Signature status (unsigned, signed, rejected)
- `signed_at` (TIMESTAMP) - Signature timestamp
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Deal } from '@/lib/supabaseEntities';

// Create deal
await Deal.create({
  backer_id: backerId,
  title: 'Deal Title',
  amount: 10000,
  status: 'pending'
});

// Filter deals
await Deal.filter({ backer_id: backerId });
```

### Partner Entity

**Table:** `partners`

**Fields:**
- `id` (UUID) - Primary key
- `backer_id` (UUID) - Reference to backers table
- `name` (VARCHAR) - Partner name
- `company` (VARCHAR) - Company name
- `email` (VARCHAR) - Partner email
- `role` (VARCHAR) - Partner role
- `notes` (TEXT) - Partner notes
- `partnership_type` (VARCHAR) - Partnership type (strategic, investment, collaboration)
- `status` (VARCHAR) - Partner status (active, inactive, pending)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Partner } from '@/lib/supabaseEntities';

// Create partner
await Partner.create({
  backer_id: backerId,
  name: 'Partner Name',
  company: 'Company Name',
  partnership_type: 'strategic'
});

// Filter partners
await Partner.filter({ backer_id: backerId });
```

### InvestmentTier Entity

**Table:** `investment_tiers`

**Fields:**
- `id` (UUID) - Primary key
- `backer_id` (UUID) - Reference to backers table
- `name` (VARCHAR) - Tier name
- `min_investment` (DECIMAL) - Minimum investment
- `max_investment` (DECIMAL) - Maximum investment
- `roi_percentage` (DECIMAL) - ROI percentage
- `benefits` (TEXT[]) - Array of benefits
- `color` (VARCHAR) - Display color class
- `icon` (VARCHAR) - Icon identifier
- `is_active` (BOOLEAN) - Active status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { InvestmentTier } from '@/lib/supabaseEntities';

// Create investment tier
await InvestmentTier.create({
  backer_id: backerId,
  name: 'Gold Tier',
  min_investment: 10000,
  max_investment: 50000,
  roi_percentage: 15,
  is_active: true
});

// Filter investment tiers
await InvestmentTier.filter({ backer_id: backerId });
```

### ProjectUpdate Entity

**Table:** `project_updates`

**Fields:**
- `id` (UUID) - Primary key
- `backer_id` (UUID) - Reference to backers table
- `backed_project_id` (UUID) - Reference to backed_projects table
- `project_id` (UUID) - Reference to projects table
- `project_title` (VARCHAR) - Project title
- `title` (VARCHAR) - Update title
- `content` (TEXT) - Update content
- `update_type` (VARCHAR) - Update type (progress, milestone, announcement)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { ProjectUpdate } from '@/lib/supabaseEntities';

// Create project update
await ProjectUpdate.create({
  backer_id: backerId,
  backed_project_id: projectId,
  project_id: projectId,
  project_title: 'Project Name',
  title: 'Update Title',
  content: 'Update content',
  update_type: 'progress'
});

// Filter project updates
await ProjectUpdate.filter({ backer_id: backerId });
```

### TeamInvitation Entity

**Table:** `team_invitations`

**Fields:**
- `id` (UUID) - Primary key
- `team_id` (UUID) - Reference to teams table
- `email` (VARCHAR) - Invitee email
- `role` (VARCHAR) - Assigned role
- `token` (VARCHAR) - Invitation token
- `status` (VARCHAR) - Invitation status (pending, accepted, revoked, expired)
- `expires_at` (TIMESTAMP) - Expiration date
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { base44 } from '@/api/base44Client';

// Create invitation
await base44.entities.TeamInvitation.create({
  team_id: teamId,
  email: 'invitee@example.com',
  role: 'member',
  token: 'generated_token',
  status: 'pending',
  expires_at: expirationDate
});

// Filter invitations
await base44.entities.TeamInvitation.filter({ email: email });
```

### Job Entity

**Table:** `jobs`

**Fields:**
- `id` (UUID) - Primary key
- `client_id` (UUID) - Reference to clients table
- `title` (VARCHAR) - Job title
- `description` (TEXT) - Job description
- `category` (VARCHAR) - Job category
- `budget` (DECIMAL) - Job budget
- `status` (VARCHAR) - Job status
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { Job } from '@/lib/supabaseEntities';

// Create job
await Job.create({
  client_id: clientId,
  title: 'Job Title',
  description: 'Job description',
  budget: 5000,
  status: 'open'
});

// Filter jobs
await Job.filter({ status: 'open' });
```

### PortfolioClip Entity

**Table:** `portfolio_clips`

**Fields:**
- `id` (UUID) - Primary key
- `artist_id` (UUID) - Reference to artists table
- `team_id` (UUID) - Reference to teams table
- `title` (VARCHAR) - Clip title
- `description` (TEXT) - Clip description
- `clip_url` (TEXT) - Video/image URL
- `thumbnail_url` (TEXT) - Thumbnail URL
- `category` (VARCHAR) - Clip category
- `duration` (INTEGER) - Duration in seconds
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Operations:**
```javascript
import { PortfolioClip } from '@/lib/supabaseEntities';

// Create portfolio clip
await PortfolioClip.create({
  artist_id: artistId,
  title: 'Clip Title',
  clip_url: 'https://example.com/clip.mp4',
  category: 'film'
});

// Filter portfolio clips
await PortfolioClip.filter({ artist_id: artistId });
```

## File Uploads

### Upload File

```javascript
const response = await base44.integrations.Core.UploadFile({ file });
const fileUrl = response.file_url || response.url || response.data?.url;
```

**Supported formats:**
- Images: .jpg, .jpeg, .png, .gif, .webp, .bmp, .tiff, .jfif
- Videos: .mp4, .mov, .avi, .webm

## Email Integration

### Brevo Email Service

```javascript
import { sendTeamInvitationEmail } from '@/lib/brevoClient';

await sendTeamInvitationEmail(
  email,
  teamName,
  inviterName,
  inviteToken,
  inviteUrl
);
```

**Environment Variables:**
- `VITE_BREVO_API_KEY` - Brevo API key
- Brevo API URL: `https://api.brevo.com/v3/smtp/email`
- Sender: `noreply@studio22.com`

## Error Handling

### Standard Error Response

```javascript
try {
  await Entity.create(data);
} catch (error) {
  console.error('Error:', error.message);
  // Handle error
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are subject to rate limiting. Implement caching where appropriate to minimize API calls.

## Best Practices

1. **Always use the useAuth hook** for authentication context
2. **Filter by user-specific fields** (user_id, contact_email, backer_email) for data isolation
3. **Handle errors gracefully** with try-catch blocks
4. **Use loading states** during async operations
5. **Validate data** before sending to the API
6. **Use optimistic updates** for better UX where appropriate

## API Versioning

Current API version: v1

Breaking changes will be communicated in advance with migration guides.

---

**Document Version:** 1.0  
**Last Updated:** July 13, 2026
