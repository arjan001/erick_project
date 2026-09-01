# Eric Rabar End-to-End Test Plan

**Version**: 1.0  
**Last Updated**: July 1, 2026  
**Status**: In Progress  

---

## Overview

This document outlines the comprehensive end-to-end testing strategy for Eric Rabar, covering all critical user flows, API endpoints, and UI components.

### Testing Scope

- **Authentication Flows**: Login, signup, logout, role-based access
- **User Role Workflows**: Artist, Team, Client, Backer, Admin dashboards
- **Core Features**: Jobs, Projects, Applications, Messaging, Network
- **Admin Panel**: All 14+ admin management pages
- **API Endpoints**: All entity CRUD operations
- **Real-time Features**: WebSocket subscriptions, notifications
- **File Uploads**: Portfolio clips, logos, project images
- **Payment Integration**: Stripe checkout (test mode)

### Testing Tools

- **Unit Testing**: Vitest (to be installed)
- **E2E Testing**: Playwright (to be installed)
- **Component Testing**: Vitest + React Testing Library (to be installed)
- **API Testing**: Supabase test utilities

---

## Test Environment Setup

### Prerequisites

```bash
# Install testing dependencies
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test

# Install Supabase test utilities
npm install -D @supabase/supabase-js
```

### Environment Variables

Create `.env.test`:

```env
VITE_SUPABASE_URL=https://test-project.supabase.co
VITE_SUPABASE_ANON_KEY=test_anon_key
VITE_BASE44_APP_ID=test_app_id
VITE_PUBLISHABLE_KEY=test_publishable_key
VITE_BASE44_APP_BASE_URL=https://test.base44.app
```

### Test Database

Use Supabase test project or local PostgreSQL instance with test data.

---

## Test Categories

### 1. Authentication Tests

#### 1.1 User Login

**Test Case**: TC-AUTH-001  
**Priority**: Critical  
**Description**: Verify users can log in with valid credentials

**Steps**:
1. Navigate to `/SignIn`
2. Enter valid email: `artist@artist.com`
3. Enter valid password: `artist@artist.com`
4. Click "Sign In" button
5. Verify redirect to appropriate dashboard based on role

**Expected Result**:
- User is authenticated
- Redirected to correct dashboard (Artist → `/artistdashboard`)
- Session stored in localStorage
- No console errors

**Test Data**:
```javascript
{
  email: 'artist@artist.com',
  password: 'artist@artist.com',
  expectedRole: 'artist',
  expectedRedirect: '/artistdashboard'
}
```

---

#### 1.2 Invalid Login

**Test Case**: TC-AUTH-002  
**Priority**: Critical  
**Description**: Verify login fails with invalid credentials

**Steps**:
1. Navigate to `/SignIn`
2. Enter invalid email or password
3. Click "Sign In" button
4. Verify error message displayed

**Expected Result**:
- Login fails
- Error message: "Invalid credentials"
- User remains on login page
- No session created

---

#### 1.3 Logout

**Test Case**: TC-AUTH-003  
**Priority**: Critical  
**Description**: Verify users can log out successfully

**Steps**:
1. Log in as any user
2. Click logout button in sidebar
3. Verify redirect to `/SignIn`
4. Check localStorage is cleared

**Expected Result**:
- Session cleared
- Redirected to login page
- No authentication state persists

---

#### 1.4 Role-Based Access Control

**Test Case**: TC-AUTH-004  
**Priority**: Critical  
**Description**: Verify users can only access routes for their role

**Steps**:
1. Log in as artist
2. Attempt to access `/Admin`
3. Verify redirect or access denied
4. Log in as admin
5. Access `/Admin`
6. Verify successful access

**Expected Result**:
- Artist cannot access admin routes
- Admin can access admin routes
- Proper guards enforce role restrictions

---

### 2. Artist Dashboard Tests

#### 2.1 Artist Profile Creation

**Test Case**: TC-ART-001  
**Priority**: High  
**Description**: Verify artists can create their profile

**Steps**:
1. Log in as artist
2. Navigate to onboarding modal (if new user)
3. Fill in profile details:
   - Display name
   - Stage name
   - Skills (select from database)
   - Years of experience
   - Hourly rate
   - Availability status
4. Upload profile photo
5. Submit profile

**Expected Result**:
- Profile created successfully
- Redirected to dashboard
- Profile data displayed correctly
- Photo uploaded to storage

---

#### 2.2 Portfolio Clip Upload

**Test Case**: TC-ART-002  
**Priority**: High  
**Description**: Verify artists can upload portfolio clips

**Steps**:
1. Navigate to Artist Profile page
2. Click "Add Portfolio Clip"
3. Upload video file
4. Enter clip details:
   - Title
   - Description
   - Project name
   - Role
   - Duration
5. Mark as featured if desired
6. Submit

**Expected Result**:
- Video uploaded to Supabase Storage
- Clip record created in database
- Clip appears in portfolio grid
- Thumbnail generated

---

#### 2.3 Job Application

**Test Case**: TC-ART-003  
**Priority**: High  
**Description**: Verify artists can apply to jobs

**Steps**:
1. Navigate to `/Jobs`
2. Browse available jobs
3. Click "Apply" on a job
4. Write cover letter
5. Submit application

**Expected Result**:
- Application created in database
- Job status updated (if applicable)
- Notification sent to client
- Application appears in JobApplications page

---

#### 2.4 Job Invitation Response

**Test Case**: TC-ART-004  
**Priority**: Medium  
**Description**: Verify artists can respond to job invitations

**Steps**:
1. Navigate to `/JobInvitations`
2. View pending invitation
3. Click "Accept" or "Decline"
4. Verify response recorded

**Expected Result**:
- Invitation status updated
- If accepted, chat started
- Notification sent to client

---

### 3. Client Dashboard Tests

#### 3.1 Client Profile Creation

**Test Case**: TC-CLI-001  
**Priority**: High  
**Description**: Verify clients can create their profile

**Steps**:
1. Log in as client
2. Navigate to profile setup
3. Fill in company details:
   - Company name
   - Industry
   - Company size
   - Budget range
   - Website
4. Submit profile

**Expected Result**:
- Profile created successfully
- Company details displayed
- Redirected to dashboard

---

#### 3.2 Project Posting

**Test Case**: TC-CLI-002  
**Priority**: Critical  
**Description**: Verify clients can post projects

**Steps**:
1. Navigate to `/SubmitProject` or dashboard
2. Fill in project details:
   - Title
   - Description
   - Project type (commercial, film, etc.)
   - Location
   - Timeline (start/end dates)
   - Budget range
   - Upload project image
3. Submit project

**Expected Result**:
- Project created in database
- Image uploaded to storage
- Project status: 'submitted'
- Project appears in dashboard

---

#### 3.3 Job Posting

**Test Case**: TC-CLI-003  
**Priority**: Critical  
**Description**: Verify clients can post jobs

**Steps**:
1. Click "Post a Job" in dashboard
2. Fill in job details:
   - Title
   - Description
   - Short description
   - Location
   - Budget range (min/max)
   - Budget type (fixed/hourly)
   - Roles needed
   - Skills required
   - Project types
3. Submit job

**Expected Result**:
- Job created in database
- Job status: 'open'
- Job appears in job board
- Artists can view and apply

---

#### 3.4 Job Invitation

**Test Case**: TC-CLI-004  
**Priority**: Medium  
**Description**: Verify clients can invite artists to jobs

**Steps**:
1. Navigate to job details
2. Click "Invite Artist"
3. Search/select artist
4. Write invitation message
5. Send invitation

**Expected Result**:
- Invitation created in database
- Artist receives notification
- Invitation appears in artist's JobInvitations page

---

### 4. Team Dashboard Tests

#### 4.1 Team Profile Creation

**Test Case**: TC-TEAM-001  
**Priority**: High  
**Description**: Verify teams can create their profile

**Steps**:
1. Log in as team
2. Navigate to team setup
3. Fill in team details:
   - Team name
   - Specialties
   - Team size
   - Hourly rate
   - Availability status
   - Website
   - Social media
4. Upload team logo
5. Submit profile

**Expected Result**:
- Team profile created
- Logo uploaded to storage
- Specialties saved as array
- Redirected to dashboard

---

#### 4.2 Team Member Management

**Test Case**: TC-TEAM-002  
**Priority**: High  
**Description**: Verify teams can add/remove members

**Steps**:
1. Navigate to Team Profile
2. Click "Add Member"
3. Enter member details:
   - Name
   - Role
   - Skills
   - Avatar
4. Submit
5. Verify member appears in list
6. Remove member
7. Verify member removed

**Expected Result**:
- Member added successfully
- Member removed successfully
- Team member count updated

---

#### 4.3 Team Invitation

**Test Case**: TC-TEAM-003  
**Priority**: Medium  
**Description**: Verify teams can invite new members

**Steps**:
1. Click "Send Invitation"
2. Enter invitee email
3. Set member role
4. Set expiration date
5. Send invitation

**Expected Result**:
- Invitation created
- Email sent (if configured)
- Invitee can accept via `/AcceptTeamInvite`

---

### 5. Backer Dashboard Tests

#### 5.1 Backer Profile Creation

**Test Case**: TC-BACK-001  
**Priority**: High  
**Description**: Verify backers can create their profile

**Steps**:
1. Log in as backer
2. Navigate to profile setup
3. Fill in organization details:
   - Organization name
   - Investment focus areas
   - Website
   - Social media
   - Bio
4. Submit profile

**Expected Result**:
- Backer profile created
- Investment focus saved as array
- Profile displayed in dashboard

---

#### 5.2 Backing a Project

**Test Case**: TC-BACK-002  
**Priority**: Critical  
**Description**: Verify backers can back projects

**Steps**:
1. Navigate to `/BackerProjects`
2. Browse available projects
3. Click "Back Project"
4. Enter investment amount
5. Confirm payment (test mode)
6. Verify backing created

**Expected Result**:
- Backed project record created
- Project funding updated
- Backer totals updated
- Expected ROI calculated (15%)

---

#### 5.3 Investment Analytics

**Test Case**: TC-BACK-003  
**Priority**: Medium  
**Description**: Verify investment analytics display correctly

**Steps**:
1. Navigate to `/BackerAnalytics`
2. Verify statistics:
   - Total invested
   - Total expected ROI
   - ROI percentage
   - Active investments
   - Completed investments
3. Verify charts render correctly

**Expected Result**:
- All statistics calculated correctly
- Charts display without errors
- Data matches database records

---

### 6. Admin Panel Tests

#### 6.1 User Management

**Test Case**: TC-ADM-001  
**Priority**: Critical  
**Description**: Verify admin can manage all users

**Steps**:
1. Navigate to `/Admin/UserManagement`
2. Verify all user types listed:
   - Artists
   - Teams
   - Clients
   - Backers
   - Admins
3. Search/filter users
4. View user details
5. Edit user information
6. Delete user (test account)

**Expected Result**:
- All users displayed
- Search/filter works
- User details accurate
- Edits saved
- User deleted successfully

---

#### 6.2 Artist Approval

**Test Case**: TC-ADM-002  
**Priority**: Critical  
**Description**: Verify admin can approve/reject artists

**Steps**:
1. Navigate to `/ArtistAdmin` or `/Admin/UserManagement`
2. View pending artists
3. Review artist portfolio
4. Add admin notes
5. Approve or reject artist

**Expected Result**:
- Artist status updated
- Admin notes saved
- Approval date recorded (if approved)
- Artist notified

---

#### 6.3 Team Approval

**Test Case**: TC-ADM-003  
**Priority**: Critical  
**Description**: Verify admin can approve/reject/suspend teams

**Steps**:
1. Navigate to `/TeamAdmin`
2. View pending teams
3. Review team details
4. Approve, reject, or suspend team
5. Add admin notes

**Expected Result**:
- Team status updated
- Admin notes saved
- Suspension recorded
- Team notified

---

#### 6.4 Project Management

**Test Case**: TC-ADM-004  
**Priority**: High  
**Description**: Verify admin can manage projects

**Steps**:
1. Navigate to `/Admin/Projects`
2. View all projects
3. Filter by status
4. Approve/reject projects
5. Enable/disable backing
6. View project details

**Expected Result**:
- All projects displayed
- Filters work correctly
- Status updates saved
- Backing toggle works

---

#### 6.5 General Settings

**Test Case**: TC-ADM-005  
**Priority**: Medium  
**Description**: Verify admin can update system settings

**Steps**:
1. Navigate to `/Admin/GeneralSettings`
2. Update system settings:
   - Site name
   - Site description
   - Email provider (Brevo/Resend)
   - Email sender address
3. Update subscription settings
4. Save changes

**Expected Result**:
- Settings saved to database
- Changes reflected immediately
- No errors on save

---

#### 6.6 SEO & CMS

**Test Case**: TC-ADM-006  
**Priority**: Medium  
**Description**: Verify admin can manage CMS pages and SEO

**Steps**:
1. Navigate to `/Admin/SEOCMS`
2. Create new CMS page:
   - Title
   - Slug
   - Meta title
   - Meta description
   - Content
3. Generate SEO rules
4. Save page
5. Verify page accessible

**Expected Result**:
- Page created in database
- SEO rules generated
- Page accessible via slug
- Meta tags render correctly

---

#### 6.7 API Settings

**Test Case**: TC-ADM-007  
**Priority**: High  
**Description**: Verify admin can manage API keys and settings

**Steps**:
1. Navigate to `/Admin/APISettings`
2. Create API key:
   - Name
   - Permissions
   - Rate limit
3. Configure CORS
4. View audit logs
5. Revoke API key

**Expected Result**:
- API key created
- Permissions set correctly
- CORS configured
- Audit logs recorded
- Key revoked successfully

---

#### 6.8 Payment Settings

**Test Case**: TC-ADM-008  
**Priority**: High  
**Description**: Verify admin can configure payment providers

**Steps**:
1. Navigate to `/Admin/PaymentSettings`
2. Configure Stripe:
   - Public key
   - Secret key (server-side)
   - Webhook secret
3. Configure other providers
4. Test payment flow
5. Save settings

**Expected Result**:
- Stripe configured
- Payment test successful
- Settings saved securely
- No keys exposed in client

---

### 7. Network & Messaging Tests

#### 7.1 Connection Requests

**Test Case**: TC-NET-001  
**Priority**: Medium  
**Description**: Verify users can send and accept connection requests

**Steps**:
1. Navigate to `/Network`
2. Search for user
3. Send connection request
4. Log in as recipient
5. Accept or decline request
6. Verify connection status

**Expected Result**:
- Request sent
- Notification received
- Connection established on accept
- Request declined on reject

---

#### 7.2 Messaging

**Test Case**: TC-NET-002  
**Priority**: Critical  
**Description**: Verify real-time messaging works

**Steps**:
1. Open browser as User A
2. Open browser as User B (different session)
3. User A sends message to User B
4. Verify User B receives message in real-time
5. User B replies
6. Verify User A receives reply

**Expected Result**:
- Messages sent successfully
- Real-time delivery working
- Conversation history maintained
- Read status updates

---

#### 7.3 Endorsements

**Test Case**: TC-NET-003  
**Priority**: Medium  
**Description**: Verify users can endorse skills

**Steps**:
1. Navigate to artist/team profile
2. Click "Endorse"
3. Select skill
4. Add rating (1-5)
5. Write comment
6. Submit endorsement

**Expected Result**:
- Endorsement created
- Rating recorded
- Comment saved
- Endorsement appears on profile

---

#### 7.4 Testimonials

**Test Case**: TC-NET-004  
**Priority**: Medium  
**Description**: Verify users can write testimonials

**Steps**:
1. Navigate to completed project
2. Click "Write Testimonial"
3. Add rating
4. Write title and content
5. Submit testimonial

**Expected Result**:
- Testimonial created
- Rating recorded
- Content saved
- Testimonial appears on profile

---

### 8. API Endpoint Tests

#### 8.1 Entity CRUD Operations

**Test Case**: TC-API-001  
**Priority**: Critical  
**Description**: Verify all entity CRUD operations work

**Entities to test**:
- Job
- Project
- Application
- JobInvitation
- Artist
- Team
- Client (ProjectOwner)
- Backer
- PortfolioClip
- Message
- Notification
- Connection
- Endorsement
- Testimonial

**Test Pattern**:
```javascript
// For each entity:
1. CREATE: Create record with valid data
2. READ: Get record by
3. UPDATE: Update record with changes
4. LIST: List all records
5. FILTER: Filter records by criteria
6. DELETE: Delete record
7. Verify all operations succeed
```

---

#### 8.2 Real-time Subscriptions

**Test Case**: TC-API-002  
**Priority**: High  
**Description**: Verify real-time subscriptions work

**Steps**:
1. Subscribe to entity changes
2. Create record
3. Verify subscription callback fired
4. Update record
5. Verify subscription callback fired
6. Delete record
7. Verify subscription callback fired
8. Unsubscribe
9. Verify no more callbacks

**Expected Result**:
- Subscription established
- All change events received
- Payload structure correct
- Unsubscribe stops callbacks

---

#### 8.3 Filter Operators

**Test Case**: TC-API-003  
**Priority**: Medium  
**Description**: Verify all filter operators work

**Test Operators**:
- Exact match: `{ field: value }`
- Greater than: `{ field: { $gt: value } }`
- Less than: `{ field: { $lt: value } }`
- Greater than or equal: `{ field: { $gte: value } }`
- Less than or equal: `{ field: { $lte: value } }`

**Expected Result**:
- All operators work correctly
- Results match filter criteria
- No errors on invalid operators

---

### 9. File Upload Tests

#### 9.1 Profile Photo Upload

**Test Case**: TC-FILE-001  
**Priority**: High  
**Description**: Verify profile photo uploads work

**Steps**:
1. Navigate to profile settings
2. Upload image file (JPG/PNG)
3. Verify upload progress
4. Verify image appears in profile
5. Verify image URL is public

**Expected Result**:
- File uploaded to `profile-photos` bucket
- Image displayed correctly
- URL accessible
- File size limits enforced

---

#### 9.2 Portfolio Clip Upload

**Test Case**: TC-FILE-002  
**Priority**: High  
**Description**: Verify video uploads work

**Steps**:
1. Navigate to portfolio section
2. Upload video file (MP4/MOV)
3. Enter clip metadata
4. Submit
5. Verify video playable

**Expected Result**:
- Video uploaded to `portfolio-clips` bucket
- Thumbnail generated
- Video playable in browser
- Metadata saved correctly

---

#### 9.3 Project Image Upload

**Test Case**: TC-FILE-003  
**Priority**: Medium  
**Description**: Verify project image uploads work

**Steps**:
1. Navigate to project creation
2. Upload project image
3. Submit project
4. Verify image displayed

**Expected Result**:
- Image uploaded to `project-images` bucket
- Image displayed in project card
- URL accessible

---

### 10. Payment Integration Tests

#### 10.1 Subscription Checkout

**Test Case**: TC-PAY-001  
**Priority**: High  
**Description**: Verify subscription checkout works

**Steps**:
1. Navigate to subscription checkout
2. Select package
3. Enter card details (test card)
4. Submit payment
5. Verify payment success
6. Verify subscription activated

**Test Card Data**:
```javascript
{
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/25',
  cvv: '123',
  cardholder: 'Test User'
}
```

**Expected Result**:
- Stripe checkout opens
- Payment processed in test mode
- Subscription record created
- User access updated

---

#### 10.2 Payment Failure

**Test Case**: TC-PAY-002  
**Priority**: Medium  
**Description**: Verify payment failures handled correctly

**Steps**:
1. Navigate to checkout
2. Enter invalid card data
3. Submit payment
4. Verify error message

**Test Card Data**:
```javascript
{
  cardNumber: '4000 0000 0000 0002', // Declined card
  expiry: '12/25',
  cvv: '123'
}
```

**Expected Result**:
- Payment fails
- Error message displayed
- No subscription created
- User can retry

---

## Test Execution Plan

### Phase 1: Critical Path Testing (Week 1)

- TC-AUTH-001 to TC-AUTH-004 (Authentication)
- TC-CLI-002 to TC-CLI-003 (Client Core Features)
- TC-ART-003 (Job Applications)
- TC-ADM-001 to TC-ADM-004 (Admin Core Features)
- TC-API-001 (Entity CRUD)
- TC-NET-002 (Messaging)

### Phase 2: Feature Testing (Week 2)

- TC-ART-001 to TC-ART-004 (Artist Features)
- TC-CLI-001, TC-CLI-004 (Client Features)
- TC-TEAM-001 to TC-TEAM-003 (Team Features)
- TC-BACK-001 to TC-BACK-003 (Backer Features)
- TC-NET-001, TC-NET-003, TC-NET-004 (Network Features)

### Phase 3: Admin & Integration Testing (Week 3)

- TC-ADM-005 to TC-ADM-008 (Admin Advanced Features)
- TC-API-002 to TC-API-003 (API Advanced)
- TC-FILE-001 to TC-FILE-003 (File Uploads)
- TC-PAY-001 to TC-PAY-002 (Payments)

### Phase 4: Regression & Performance (Week 4)

- Re-run all critical tests
- Performance testing
- Cross-browser testing
- Mobile responsiveness testing

---

## Test Automation Setup

### Vitest Configuration

Create `vitest.config.js`:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  }
});
```

### Playwright Configuration

Create `playwright.config.js`:

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' }
  ]
});
```

### Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Test Data Management

### Seed Data

Create `src/test/seed-data.js`:

```javascript
export const testUsers = [
  {
    email: 'test-artist@example.com',
    password: 'test123',
    role: 'artist',
    displayName: 'Test Artist'
  },
  {
    email: 'test-client@example.com',
    password: 'test123',
    role: 'client',
    companyName: 'Test Company'
  }
];

export const testJobs = [
  {
    title: 'Test Job',
    description: 'Test job description',
    client_email: 'test-client@example.com',
    status: 'open'
  }
];
```

### Database Cleanup

Create `src/test/cleanup.js`:

```javascript
import { supabase } from '@/lib/supabase';

export async function cleanupTestData() {
  // Delete test records
  await supabase.from('jobs').delete().ilike('title', 'Test%');
  await supabase.from('applications').delete().ilike('cover_letter', 'Test%');
  // ... more cleanup
}
```

---

## Success Criteria

### Test Coverage Targets

- **Unit Tests**: 70% code coverage
- **Component Tests**: 80% component coverage
- **E2E Tests**: 100% critical path coverage

### Quality Gates

- All critical tests must pass
- No high-severity bugs
- Performance within acceptable limits
- No security vulnerabilities

### Definition of Done

- All test cases executed
- All bugs documented and prioritized
- Test report generated
- Performance metrics recorded
- Security scan completed

---

## Reporting

### Test Report Template

```markdown
# Test Execution Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Environment]

## Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Skipped: [Number]
- Pass Rate: [Percentage]

## Failed Tests
| Test Case | Description | Error | Severity |
|-----------|-------------|-------|----------|
| TC-XXX | Description | Error message | High/Medium/Low |

## Blocked Tests
| Test Case | Reason |
|-----------|--------|
| TC-XXX | Description |

## Recommendations
[Findings and recommendations]
```

---

## Next Steps

1. Install testing dependencies
2. Configure test environment
3. Create test database
4. Implement critical path tests
5. Execute Phase 1 tests
6. Document and fix bugs
7. Continue with remaining phases
8. Generate final test report

---

**Document Version**: 1.0  
**Last Updated**: July 1, 2026  
**Status**: Ready for Execution
