# Studio22 Admin Documentation

## Overview

The Studio22 Admin Panel provides comprehensive management capabilities for administrators to oversee all aspects of the platform. This document covers all admin features, permissions, and best practices.

## Access Requirements

### Admin Roles

**Required Roles:**
- `admin` - Full system administrator access
- `artist_admin` - Limited admin access for artist-related operations

### Authentication

Admin users must:
1. Log in with their admin credentials
2. Have the appropriate role assigned
3. Pass the role guard check on admin routes

## Admin Dashboard Navigation

### Main Sections

1. **User Management** - Manage all platform users
2. **Roles & Permissions** - Configure access control
3. **Audit Logs** - View system activity
4. **General Settings** - System-wide configuration
5. **SEO & CMS** - Content management
6. **Image Storage** - Monitor file storage
7. **Invites Management** - User invitations
8. **Login Providers** - OAuth configuration
9. **API Settings** - API configuration
10. **Payment Settings** - Payment gateway setup
11. **Finance Dashboard** - Revenue tracking
12. **Jobs Management** - Job postings
13. **Projects Management** - Backed projects
14. **Clients Management** - Client accounts
15. **Messages** - Admin messaging

## User Management

### Features

- **View all users** with filtering and search
- **Create new users** with role assignment
- **Edit user profiles** and permissions
- **Delete users** with confirmation
- **Manage user status** (active, suspended, banned)
- **Bulk operations** for multiple users

### User Types Supported

- Artist
- Client
- Backer
- Team
- Project Owner
- Admin

### Operations

#### View Users

Navigate to `/AdminUserManagement` to see all users with:
- Name and email
- Role and status
- Registration date
- Last activity
- Quick actions (edit, delete)

#### Create User

1. Click "Add User" button
2. Fill in user details:
   - Email
   - First name
   - Last name
   - Role selection
   - Initial password
3. Click "Create User"

#### Edit User

1. Click edit icon on user row
2. Modify user information
3. Click "Save Changes"

#### Delete User

1. Click delete icon on user row
2. Confirm deletion
3. User and associated data will be removed

#### Filter Users

Use filters to find specific users:
- By role
- By status
- By email
- By registration date

## Roles & Permissions

### Permission Categories

1. **User Management** - Create, edit, delete users
2. **Content Management** - Manage jobs, projects, content
3. **Financial Access** - View financial data
4. **System Settings** - Modify system configuration
5. **Audit Logs** - View system activity logs
6. **API Access** - Manage API keys and settings
7. **Payment Management** - Configure payment gateways
8. **Admin Messaging** - Send admin messages

### Role Configuration

#### Create Role

1. Navigate to `/AdminRolesPermissions`
2. Click "Add Role"
3. Enter role name
4. Select permissions
5. Click "Create Role"

#### Edit Role Permissions

1. Click on role in the list
2. Toggle permissions on/off
3. Click "Save Changes"

#### Delete Role

1. Click delete icon on role
2. Confirm deletion
3. Role will be removed from all assigned users

### Default Roles

- **Admin** - All permissions enabled
- **Artist Admin** - Limited permissions for artist management
- **Moderator** - Content moderation permissions
- **Support** - User support permissions

## Audit Logs

### Log Types

- User creation/deletion
- Role changes
- Permission modifications
- System setting changes
- Login attempts
- Failed operations

### Viewing Logs

1. Navigate to `/AdminAuditLogs`
2. Filter by:
   - Date range
   - User
   - Action type
   - Entity type
3. View detailed log entries

### Log Retention

Logs are retained for 90 days by default. This can be configured in General Settings.

## General Settings

### System Configuration

#### Basic Settings

- Site name
- Site description
- Contact email
- Support phone
- Timezone
- Language

#### Subscription Settings

- Plan names (Basic, Pro, Enterprise)
- Pricing tiers
- Free trial duration
- Billing cycles (monthly, yearly)
- Feature limits per plan

#### Maintenance Mode

Enable maintenance mode to temporarily disable the platform for all non-admin users.

### Configuration Steps

1. Navigate to `/AdminGeneralSettings`
2. Modify desired settings
3. Click "Save Changes"
4. Settings take effect immediately

## SEO & CMS

### CMS Pages Management

#### Create Page

1. Navigate to `/AdminSEOCMS`
2. Click "Add Page"
3. Enter page details:
   - Title
   - Slug/URL
   - Content
   - Meta description
   - Keywords
4. Click "Create Page"

#### Edit Page

1. Click edit icon on page
2. Modify content and metadata
3. Click "Save Changes"

#### Delete Page

1. Click delete icon on page
2. Confirm deletion
3. Page will be removed

### SEO Settings

#### Meta Tags

- Page titles
- Meta descriptions
- OG tags (Open Graph)
- Twitter cards
- Canonical URLs

 Structured Data

- Schema.org markup
- JSON-LD format
- Product schema
- Organization schema

#### URL Redirects

- Create 301 redirects
- Manage redirect rules
- Track redirect performance

### Auto-Generated Rules

The system automatically generates:
- Meta titles based on page content
- Meta descriptions from first paragraph
- OG tags from page images
- Structured data for products

## Image Storage

### Storage Monitoring

View storage usage by:
- File type (images, videos, documents)
- Upload date
- File size
- Uploader

### File Management

#### View Files

1. Navigate to `/AdminImageStorage`
2. Browse files with filters
3. View file details

#### Delete Files

1. Select file(s)
2. Click "Delete"
3. Confirm deletion
4. Files are permanently removed

#### Storage Limits

- Total storage capacity
- Per-user limits
- File size limits
- Type restrictions

### Storage Optimization

- Compress images automatically
- Generate thumbnails
- Cache frequently accessed files
- Implement CDN integration

## Invites Management

### User Invitations

#### Create Invitation

1. Navigate to `/AdminInvitesManagement`
2. Click "Send Invite"
3. Enter:
   - Recipient email
   - Role assignment
   - Expiration date
   - Custom message
4. Click "Send Invite"

#### Invitation Tokens

- Unique token per invitation
- Configurable expiration (default 7 days)
- One-time use
- Revocable by admin

#### Manage Invitations

- View all pending invitations
- Resend expired invitations
- Revoke pending invitations
- Track invitation status

### Invitation Status

- **Pending** - Awaiting acceptance
- **Accepted** - User registered
- **Expired** - Token expired
- **Revoked** - Cancelled by admin

## Login Providers

### Supported Providers

- Google OAuth
- GitHub OAuth
- Facebook OAuth
- LinkedIn OAuth
- Twitter OAuth
- Email/Password
- Two-Factor Authentication (2FA)

### Configuration

#### Add OAuth Provider

1. Navigate to `/AdminLoginProviders`
2. Click "Add Provider"
3. Select provider type
4. Enter:
   - Client ID
   - Client Secret
   - Callback URL
   - Scopes
5. Click "Save"

#### Enable/Disable Providers

Toggle provider status to enable or disable authentication method.

#### 2FA Configuration

- Enable 2FA for specific roles
- Configure authenticator apps
- Set up SMS verification
- Recovery codes generation

### Provider Settings

- Default provider
- Provider priority order
- Required providers per role
- Session duration

## API Settings

### API Key Management

#### Generate API Key

1. Navigate to `/AdminAPISettings`
2. Click "Generate API Key"
3. Set key permissions
4. Set expiration (optional)
5. Click "Generate"
6. Copy key securely

#### Manage API Keys

- View all active keys
- Revoke compromised keys
- Set key permissions
- Monitor key usage

### Rate Limiting

Configure rate limits by:
- Endpoint
- User role
- API key
- Time window

### CORS Configuration

- Allowed origins
- Allowed methods
- Allowed headers
- Credentials policy

### JWT Authentication

- Token expiration
- Refresh token policy
- Secret key rotation
- Token revocation

### Webhooks

#### Configure Webhooks

1. Click "Add Webhook"
2. Enter:
   - Endpoint URL
   - Events to trigger
   - Authentication method
3. Click "Save"

#### Webhook Events

- User created
- User deleted
- Payment received
- Job posted
- Project funded

### API Versioning

- Current version: v1
- Version deprecation policy
- Breaking change notifications
- Migration guides

## Payment Settings

### Supported Gateways

- Stripe
- PayPal
- Braintree
- Square
- Adyen

### Configuration

#### Add Payment Gateway

1. Navigate to `/AdminPaymentSettings`
2. Click "Add Gateway"
3. Select gateway type
4. Enter:
   - API key
   - Secret key
   - Webhook URL
   - Test mode toggle
5. Click "Save"

#### Payment Methods

- Credit cards
- Debit cards
- Bank transfers
- Digital wallets
- Cryptocurrency (future)

### Subscription Management

#### Plan Configuration

- Basic Plan
- Pro Plan
- Enterprise Plan

Each plan includes:
- Monthly/yearly pricing
- Feature limits
- Trial period
- Cancellation policy

#### Invoicing

- Automatic invoice generation
- Custom invoice templates
- Payment reminders
- Late fee configuration

### Tax Configuration

- Tax rates by region
- Tax-exempt status
- Tax calculation rules
- Reporting requirements

### Refund Policy

- Refund time window
- Automatic refunds
- Manual refund processing
- Refund reasons tracking

## Finance Dashboard

### Revenue Tracking

#### Metrics Displayed

- Total revenue
- Revenue by source
- Revenue by period
- Average transaction value
- Subscription revenue
- One-time payments

#### Charts & Graphs

- Revenue trend over time
- Revenue by payment method
- Revenue by user type
- Revenue by region

### Transaction History

View all transactions with:
- Transaction ID
- Amount
- Payment method
- User
- Date
- Status

#### Filter Transactions

- By date range
- By payment method
- By status
- By user

### Revenue Sources

- Subscription payments
- Job posting fees
- Project funding fees
- Premium features
- Marketplace commissions

## Jobs Management

### Job Overview

View all job postings with:
- Job title
- Client name
- Budget
- Category
- Status
- Posted date

### Job Operations

#### View Jobs

Navigate to `/AdminJobs` to see all job postings.

#### Edit Job

1. Click edit icon on job
2. Modify job details
3. Click "Save Changes"

#### Delete Job

1. Click delete icon on job
2. Confirm deletion
3. Job will be removed

#### Change Status

Update job status:
- Open
- In Progress
- Closed
- Cancelled

### Job Categories

- Film & Video
- Photography
- Design
- Music
- Writing
- Development
- Marketing

## Projects Management

### Project Overview

View all backed projects with:
- Project title
- Backer name
- Funding goal
- Current funding
- Category
- Status

### Project Operations

#### View Projects

Navigate to `/AdminProjects` to see all projects.

#### Edit Project

1. Click edit icon on project
2. Modify project details
3. Click "Save Changes"

#### Delete Project

1. Click delete icon on project
2. Confirm deletion
3. Project will be removed

#### Update Status

Track project progress:
- Funding
- In Progress
- Completed
- Cancelled

### Project Categories

- Film Projects
- Music Videos
- Documentaries
- Commercial
- Art Projects
- Technology

## Clients Management

### Client Overview

View all clients with:
- Company name
- Contact email
- Industry
- Projects posted
- Total spent
- Rating

### Client Operations

#### View Clients

Navigate to `/AdminClients` to see all clients.

#### Edit Client

1. Click edit icon on client
2. Modify client details
3. Click "Save Changes"

#### Delete Client

1. Click delete icon on client
2. Confirm deletion
3. Client will be removed

### Client Metrics

- Active projects
- Total spending
- Average project budget
- Client satisfaction rating

## Admin Messaging

### Message Management

#### Send Message

1. Navigate to `/AdminMessages`
2. Click "Compose"
3. Enter:
   - Recipient (user or broadcast)
   - Subject
   - Message body
4. Click "Send"

#### View Conversations

- Individual user conversations
- Broadcast messages
- System notifications
- Support tickets

#### Message Actions

- Reply to messages
- Archive conversations
- Delete messages
- Mark as read/unread

### Message Types

- Direct messages
- Broadcast announcements
- System notifications
- Support responses

### Message Templates

Create reusable message templates for:
- Welcome messages
- Account verification
- Subscription reminders
- Payment confirmations

## Security Best Practices

### Admin Account Security

1. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, symbols
2. **Enable 2FA** - Two-factor authentication for all admin accounts
3. **Regular password rotation** - Change passwords every 90 days
4. **Limit admin access** - Only grant admin access when necessary
5. **Monitor login attempts** - Review failed login attempts regularly

### Data Protection

1. **Encrypt sensitive data** - All passwords and personal data encrypted
2. **Regular backups** - Daily automated backups
3. **Access logging** - All admin actions logged
4. **Data retention policy** - Follow GDPR and data protection laws
5. **Secure file uploads** - Validate and scan all uploaded files

### API Security

1. **Rotate API keys** - Regularly rotate API keys
2. **Use HTTPS** - All API calls over HTTPS
3. **Rate limiting** - Implement rate limiting on API endpoints
4. **Input validation** - Validate all user inputs
5. **SQL injection prevention** - Use parameterized queries

## Troubleshooting

### Common Issues

#### Users Cannot Login

1. Check user status (not suspended/banned)
2. Verify email is confirmed
3. Reset password if needed
4. Check authentication provider status

#### Payment Failures

1. Verify payment gateway configuration
2. Check API keys are valid
3. Review webhook URLs
4. Check payment method status

#### File Upload Errors

1. Check storage limits
2. Verify file type is allowed
3. Check file size limits
4. Review upload permissions

#### Email Not Sending

1. Verify email provider configuration
2. Check API keys
3. Review email templates
4. Check spam filters

## Support

### Admin Support Channels

- Email: admin@studio22.com
- Documentation: /docs
- Status Page: /status

### Emergency Contacts

For critical issues:
- System Administrator: admin@studio22.com
- Security Team: security@studio22.com

---

**Document Version:** 1.0  
**Last Updated:** July 13, 2026
