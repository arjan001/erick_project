# Next.js Migration Guide

**Version**: 1.0  
**Date**: July 3, 2026  
**Status**: Planning Phase

---

## Executive Summary

This document outlines the complete migration strategy for transitioning Studio22 from a React + Vite + Supabase client-side rendering (CSR) architecture to a Next.js server-side rendering (SSR) architecture with either Supabase or self-managed PostgreSQL as the backend.

**Current Architecture:**
- Frontend: React 18 + Vite (CSR)
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
- Routing: React Router (client-side)
- Data Fetching: TanStack React Query (client-side)
- Deployment: Static hosting (Vercel/Netlify)

**Target Architecture Options:**
1. **Option A**: Next.js + Supabase (recommended - minimal backend changes)
2. **Option B**: Next.js + Self-managed PostgreSQL + Custom API (full control, more complex)

---

## Table of Contents

1. [Architecture Comparison](#architecture-comparison)
2. [Migration Strategy](#migration-strategy)
3. [Database Options](#database-options)
4. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
5. [Module-by-Module Changes](#module-by-module-changes)
6. [API Changes](#api-changes)
7. [Authentication Changes](#authentication-changes)
8. [Real-time Changes](#real-time-changes)
9. [File Storage Changes](#file-storage-changes)
10. [Performance Considerations](#performance-considerations)
11. [Deployment Changes](#deployment-changes)
12. [Testing Strategy](#testing-strategy)
13. [Rollback Plan](#rollback-plan)
14. [Timeline & Resources](#timeline--resources)

---

## Architecture Comparison

### Current Architecture (React + Vite + Supabase)

```
┌─────────────────────────────────────────┐
│         Browser (Client-Side)          │
│  ┌─────────────────────────────────┐   │
│  │  React Components (CSR)         │   │
│  │  - React Router                 │   │
│  │  - React Query                  │   │
│  │  - Supabase Client SDK          │   │
│  └─────────────────────────────────┘   │
│           │                             │
│           ▼                             │
│  ┌─────────────────────────────────┐   │
│  │  Supabase (BaaS)                │   │
│  │  - PostgreSQL                   │   │
│  │  - Auth                          │   │
│  │  - Realtime                      │   │
│  │  - Storage                       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Characteristics:**
- Client-side rendering (CSR)
- Direct database access from browser
- No server-side API layer
- SEO limitations
- Fast initial load after hydration
- Simple deployment

### Target Architecture (Next.js + Supabase)

```
┌─────────────────────────────────────────┐
│         Next.js Server (SSR/SSG)        │
│  ┌─────────────────────────────────┐   │
│  │  API Routes (Server-Side)       │   │
│  │  - Auth middleware              │   │
│  │  - Data validation               │   │
│  │  - Business logic                │   │
│  └─────────────────────────────────┘   │
│           │                             │
│           ▼                             │
│  ┌─────────────────────────────────┐   │
│  │  Supabase (BaaS)                │   │
│  │  - PostgreSQL                   │   │
│  │  - Auth                          │   │
│  │  - Realtime                      │   │
│  │  - Storage                       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         Browser (Client-Side)          │
│  ┌─────────────────────────────────┐   │
│  │  React Components (Hybrid)       │   │
│  │  - Next.js Router                │   │
│  │  - SWR/React Query              │   │
│  │  - Supabase Client SDK          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Characteristics:**
- Server-side rendering (SSR) and static generation (SSG)
- API routes for server-side logic
- Better SEO
- Server-side data fetching
- More complex deployment
- Better performance for content-heavy pages

### Target Architecture (Next.js + Self-Managed PostgreSQL)

```
┌─────────────────────────────────────────┐
│         Next.js Server (SSR/SSG)        │
│  ┌─────────────────────────────────┐   │
│  │  API Routes (Server-Side)       │   │
│  │  - Auth middleware              │   │
│  │  - Data validation               │   │
│  │  - Business logic                │   │
│  │  - PostgreSQL queries           │   │
│  └─────────────────────────────────┘   │
│           │                             │
│           ▼                             │
│  ┌─────────────────────────────────┐   │
│  │  Self-Managed PostgreSQL        │   │
│  │  - Direct connection            │   │
│  │  - Connection pooling           │   │
│  │  - Custom triggers              │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Additional Services            │   │
│  │  - Auth (NextAuth.js)           │   │
│  │  - Realtime (Pusher/Socket.io)  │   │
│  │  - Storage (S3/Cloudflare R2)   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│         Browser (Client-Side)          │
│  ┌─────────────────────────────────┐   │
│  │  React Components (Hybrid)       │   │
│  │  - Next.js Router                │   │
│  │  - SWR/React Query              │   │
│  │  - API calls                    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Characteristics:**
- Full control over database
- Custom authentication system
- Custom real-time implementation
- More infrastructure management
- Higher cost for additional services
- Maximum flexibility

---

## Migration Strategy

### Recommended Approach: Option A (Next.js + Supabase)

**Rationale:**
- Minimal database changes (keep existing Supabase)
- Leverage existing Supabase features (Auth, Realtime, Storage)
- Faster migration timeline
- Lower risk
- Still get SSR benefits
- Can migrate to self-hosted PostgreSQL later if needed

### Migration Phases

**Phase 1: Foundation (Week 1-2)**
- Set up Next.js project structure
- Configure Supabase integration
- Set up authentication
- Create API route structure

**Phase 2: Core Pages (Week 3-4)**
- Migrate authentication pages
- Migrate landing/home pages
- Migrate user dashboards
- Test SSR functionality

**Phase 3: Feature Modules (Week 5-8)**
- Migrate jobs/projects module
- Migrate messaging system
- Migrate connections system
- Migrate notifications

**Phase 4: Advanced Features (Week 9-10)**
- Migrate admin panel
- Migrate backer features
- Optimize performance
- Implement caching

**Phase 5: Testing & Launch (Week 11-12)**
- Comprehensive testing
- Performance optimization
- SEO optimization
- Production deployment

---

## Database Options

### Option A: Keep Supabase (Recommended)

**Pros:**
- No database migration needed
- Keep existing Auth, Realtime, Storage
- Minimal data changes
- Faster migration
- Lower risk

**Cons:**
- Vendor lock-in
- Limited control over database
- Potential cost at scale

**Changes Required:**
- None to database schema
- Update Supabase client usage for SSR
- Add server-side Supabase client
- Update RLS policies for API routes

### Option B: Self-Managed PostgreSQL

**Pros:**
- Full control over database
- No vendor lock-in
- Potentially lower cost at scale
- Custom optimizations

**Cons:**
- Major database migration
- Need to replace Auth (NextAuth.js)
- Need to replace Realtime (Pusher/Socket.io)
- Need to replace Storage (S3/Cloudflare R2)
- Higher infrastructure complexity
- Longer migration timeline

**Changes Required:**
- Export data from Supabase
- Set up PostgreSQL instance
- Migrate schema and data
- Implement authentication system
- Implement real-time system
- Implement file storage system
- Update all database queries

---

## Step-by-Step Migration Plan

### Step 1: Project Setup

**Create Next.js Project:**
```bash
npx create-next-app@latest studio22-nextjs
cd studio22-nextjs
```

**Install Dependencies:**
```bash
# Core dependencies
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @tanstack/react-query
pnpm add next-auth
pnpm add zod

# UI dependencies
pnpm add @radix-ui/react-dialog
pnpm add @radix-ui/react-dropdown-menu
pnpm add lucide-react
pnpm add tailwindcss
pnpm add class-variance-authority
pnpm add clsx tailwind-merge

# Development dependencies
pnpm add -D @types/node
```

**Configure Tailwind CSS:**
```bash
npx tailwindcss init -p
```

**Copy Existing Configuration:**
- Copy `tailwind.config.js`
- Copy `postcss.config.js`
- Update for Next.js structure

### Step 2: Environment Configuration

**Create `.env.local`:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Create Supabase Client Helpers:**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### Step 3: Authentication Setup

**Install NextAuth:**
```bash
pnpm add next-auth @auth/core
```

**Configure NextAuth with Supabase:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()

export const { handlers, auth } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/error',
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})

export const { GET, POST } = handlers
```

**Create Auth Middleware:**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

### Step 4: Routing Structure

**Convert React Router to Next.js App Router:**

```
Current Structure (React Router):
src/
├── App.jsx
├── main.jsx
├── pages/
│   ├── Home.jsx
│   ├── Signin.jsx
│   ├── Jobs.jsx
│   └── ...
├── modules/
│   ├── artist/
│   ├── team/
│   ├── client/
│   └── ...
└── components/

Next.js Structure (App Router):
app/
├── layout.tsx
├── page.tsx
├── (auth)/
│   ├── signin/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── artist/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── team/
│   ├── client/
│   └── backer/
├── (public)/
│   ├── jobs/
│   │   └── page.tsx
│   └── work/
│       └── page.tsx
├── api/
│   ├── jobs/
│   │   └── route.ts
│   ├── messages/
│   │   └── route.ts
│   └── ...
└── components/
```

### Step 5: Component Migration

**Convert Components to Server/Client Components:**

**Server Components (default):**
- Static content
- Data fetching on server
- No interactivity
- Better SEO

```typescript
// app/jobs/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import JobCard from '@/components/jobs/JobCard'

export default async function JobsPage() {
  const supabase = createClient()
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')

  return (
    <div>
      <h1>Jobs</h1>
      {jobs?.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
```

**Client Components:**
- Interactive elements
- State management
- Event handlers
- Browser APIs

```typescript
// components/jobs/JobCard.tsx (Client Component)
'use client'

import { useState } from 'react'

export default function JobCard({ job }: { job: Job }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <h3>{job.title}</h3>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      {isExpanded && <p>{job.description}</p>}
    </div>
  )
}
```

### Step 6: Data Fetching Migration

**Replace React Query with Server Components + SWR:**

**Server-Side Data Fetching:**
```typescript
// app/api/jobs/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')

  return NextResponse.json(jobs)
}
```

**Client-Side Data Fetching (SWR):**
```typescript
// hooks/useJobs.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useJobs() {
  const { data, error, isLoading } = useSWR('/api/jobs', fetcher)
  return { jobs: data, error, isLoading }
}
```

---

## Module-by-Module Changes

### 1. Authentication Module

**Current:**
- Direct Supabase Auth from client
- `src/lib/AuthContext.jsx`

**Next.js:**
- NextAuth.js with Supabase adapter
- Server-side session management
- Middleware for route protection

**Files to Create:**
- `app/api/auth/[...nextauth]/route.ts`
- `middleware.ts`
- `app/(auth)/signin/page.tsx`
- `app/(auth)/signup/page.tsx`
- `lib/auth.ts`

**Files to Migrate:**
- `src/lib/AuthContext.jsx` → Remove (use NextAuth)
- `src/pages/Signin.jsx` → `app/(auth)/signin/page.tsx`
- `src/pages/Signup.jsx` → `app/(auth)/signup/page.tsx`

### 2. Jobs/Projects Module

**Current:**
- Client-side data fetching with React Query
- `src/modules/jobs/pages/JobBoardPage.jsx`
- `src/modules/jobs/pages/JobApplicationsPage.jsx`

**Next.js:**
- Server-side data fetching for initial load
- API routes for mutations
- SWR for client-side updates

**Files to Create:**
- `app/api/jobs/route.ts`
- `app/api/jobs/[id]/route.ts`
- `app/api/applications/route.ts`
- `app/(public)/jobs/page.tsx`
- `app/(dashboard)/artist/jobs/page.tsx`

**Files to Migrate:**
- `src/modules/jobs/pages/JobBoardPage.jsx` → `app/(public)/jobs/page.tsx`
- `src/modules/jobs/pages/JobApplicationsPage.jsx` → `app/(dashboard)/artist/jobs/page.tsx`
- `src/lib/supabaseEntities.js` → Update for SSR

### 3. Messaging Module

**Current:**
- Real-time with Supabase Realtime
- `src/modules/messages/pages/MessagesPage.jsx`
- Direct database subscriptions

**Next.js:**
- Keep Supabase Realtime (client-side)
- Server-side API for message sending
- Server components for initial data

**Files to Create:**
- `app/api/messages/route.ts`
- `app/api/messages/[conversationId]/route.ts`
- `app/(dashboard)/messages/page.tsx`

**Files to Migrate:**
- `src/modules/messages/pages/MessagesPage.jsx` → `app/(dashboard)/messages/page.tsx` (keep client component for real-time)

### 4. Connections Module

**Current:**
- Client-side data fetching
- `src/modules/connections/`

**Next.js:**
- Server-side data fetching
- API routes for connection requests

**Files to Create:**
- `app/api/connections/route.ts`
- `app/api/connections/[id]/route.ts`
- `app/(dashboard)/connections/page.tsx`

### 5. Notifications Module

**Current:**
- Real-time notifications
- `src/lib/notifications.js`

**Next.js:**
- Keep real-time (client-side)
- Server-side API for marking read

**Files to Create:**
- `app/api/notifications/route.ts`
- `app/api/notifications/[id]/route.ts`

### 6. Admin Module

**Current:**
- Client-side admin panel
- `src/modules/admin/pages/`

**Next.js:**
- Server-side admin panel
- Protected routes with middleware
- Server-side data fetching

**Files to Create:**
- `app/(admin)/layout.tsx`
- `app/(admin)/dashboard/page.tsx`
- `app/(admin)/artists/page.tsx`
- `app/(admin)/jobs/page.tsx`
- `app/api/admin/`

### 7. Backer Module

**Current:**
- Client-side backer features
- `src/modules/backer/`

**Next.js:**
- Server-side data fetching
- Protected routes

**Files to Create:**
- `app/(dashboard)/backer/`
- `app/api/backer/`

### 8. Artist Module

**Current:**
- Client-side artist dashboard
- `src/modules/artist/`

**Next.js:**
- Server-side dashboard
- API routes for profile updates

**Files to Create:**
- `app/(dashboard)/artist/dashboard/page.tsx`
- `app/(dashboard)/artist/profile/page.tsx`
- `app/api/artist/profile/route.ts`

### 9. Team Module

**Current:**
- Client-side team features
- `src/modules/team/`

**Next.js:**
- Server-side team management
- API routes

**Files to Create:**
- `app/(dashboard)/team/`
- `app/api/team/`

### 10. Client Module

**Current:**
- Client-side client features
- `src/modules/client/`

**Next.js:**
- Server-side client management
- API routes

**Files to Create:**
- `app/(dashboard)/client/`
- `app/api/client/`

---

## API Changes

### Current API Pattern (Direct Supabase)

```javascript
// Current: Direct Supabase calls from client
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'open')
```

### Next.js API Pattern (API Routes)

**Server-Side API Routes:**
```typescript
// app/api/jobs/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase.from('jobs').select('*')
  
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('jobs')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

**Client-Side API Calls:**
```typescript
// hooks/useJobs.ts
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useJobs() {
  const { data, error, isLoading } = useSWR('/api/jobs', fetcher)
  return { jobs: data, error, isLoading }
}

export function useCreateJob() {
  return useSWRMutation('/api/jobs', async (url, { arg }) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(arg),
    })
    return response.json()
  })
}
```

### API Route Structure

```
app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts
├── jobs/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── applications/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── messages/
│   ├── route.ts
│   └── [conversationId]/
│       └── route.ts
├── connections/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── notifications/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── artists/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── teams/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── clients/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── backers/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── projects/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── admin/
    ├── artists/
    │   └── [id]/
    │       └── route.ts
    └── jobs/
        └── [id]/
            └── route.ts
```

---

## Authentication Changes

### Current Authentication (Supabase Auth Direct)

```javascript
// Current: Direct Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### Next.js Authentication (NextAuth + Supabase)

**NextAuth Configuration:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createClient } from '@/lib/supabase/server'

export const { handlers, auth } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const supabase = createClient()
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        })

        if (error || !data.user) {
          return null
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata.full_name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

export const { GET, POST } = handlers
```

**Session Usage:**
```typescript
// Server Component
import { auth } from '@/app/api/auth/[...nextauth]/route'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/signin')
  }

  return <div>Welcome, {session.user.name}</div>
}
```

```typescript
// Client Component
'use client'

import { useSession } from 'next-auth/react'

export default function UserProfile() {
  const { data: session } = useSession()
  
  if (!session) {
    return <div>Please sign in</div>
  }

  return <div>Welcome, {session.user.name}</div>
}
```

**Sign In Page:**
```typescript
// app/(auth)/signin/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn('credentials', { email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

---

## Real-time Changes

### Current Real-time (Supabase Realtime Direct)

```javascript
// Current: Direct Supabase Realtime subscription
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

### Next.js Real-time (Keep Supabase Realtime)

**Real-time remains client-side:**
```typescript
// components/MessagesRealtime.tsx (Client Component)
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MessagesRealtime({ onNewMessage }: { onNewMessage: (msg: any) => void }) {
  useEffect(() => {
    const supabase = createClient()
    
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        onNewMessage(payload.new)
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [onNewMessage])

  return null
}
```

**Usage in Page:**
```typescript
// app/(dashboard)/messages/page.tsx
import MessagesRealtime from '@/components/MessagesRealtime'

export default function MessagesPage() {
  return (
    <div>
      {/* Server-side rendered messages */}
      <MessagesList />
      
      {/* Client-side real-time updates */}
      <MessagesRealtime onNewMessage={(msg) => {
        // Update state
      }} />
    </div>
  )
}
```

---

## File Storage Changes

### Current Storage (Supabase Storage Direct)

```javascript
// Current: Direct Supabase Storage upload
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`avatars/${userId}/${file.name}`, file)
```

### Next.js Storage (Keep Supabase Storage)

**Server-Side Upload:**
```typescript
// app/api/upload/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const formData = await request.formData()
  const file = formData.get('file') as File
  const userId = formData.get('userId') as string

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`avatars/${userId}/${file.name}`, file)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
```

**Client-Side Upload:**
```typescript
// components/FileUpload.tsx (Client Component)
'use client'

import { useState } from 'react'

export default function FileUpload({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    setUploading(false)
    return data.url
  }

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={uploading}
    />
  )
}
```

---

## Performance Considerations

### Server-Side Rendering Benefits

**SEO Improvements:**
- Meta tags generated server-side
- Open Graph tags
- Structured data
- Faster first contentful paint

**Performance Improvements:**
- Server-side data fetching (no client-side waterfalls)
- Static generation for static pages
- Incremental Static Regeneration (ISR)
- Image optimization with Next.js Image

**Caching Strategy:**
```typescript
// app/jobs/page.tsx
export const revalidate = 60 // Revalidate every 60 seconds

export default async function JobsPage() {
  const supabase = createClient()
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')

  return <JobList jobs={jobs} />
}
```

### Image Optimization

**Next.js Image Component:**
```typescript
import Image from 'next/image'

<Image
  src={job.image_url}
  alt={job.title}
  width={400}
  height={300}
  priority={false}
/>
```

**Configuration:**
```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-supabase-project.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
```

---

## Deployment Changes

### Current Deployment (Vite - Static)

```bash
# Build
pnpm build

# Deploy to Vercel/Netlify
vercel deploy
```

### Next.js Deployment

**Vercel (Recommended):**
```bash
# Deploy to Vercel
vercel deploy

# Production
vercel --prod
```

**Environment Variables:**
- Set up in Vercel dashboard
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Docker Deployment:**
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Run
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Testing Strategy

### Unit Testing

**Component Testing:**
```typescript
// __tests__/components/JobCard.test.tsx
import { render, screen } from '@testing-library/react'
import JobCard from '@/components/jobs/JobCard'

describe('JobCard', () => {
  it('renders job title', () => {
    render(<JobCard job={{ id: 1, title: 'Test Job' }} />)
    expect(screen.getByText('Test Job')).toBeInTheDocument()
  })
})
```

### Integration Testing

**API Route Testing:**
```typescript
// __tests__/api/jobs.test.ts
import { GET } from '@/app/api/jobs/route'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

describe('Jobs API', () => {
  it('returns jobs', async () => {
    const mockSupabase = {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }
    
    createClient.mockReturnValue(mockSupabase)
    
    const response = await GET()
    const data = await response.json()
    
    expect(data).toEqual([])
  })
})
```

### E2E Testing

**Playwright:**
```typescript
// e2e/jobs.spec.ts
import { test, expect } from '@playwright/test'

test('user can view jobs', async ({ page }) => {
  await page.goto('/jobs')
  await expect(page.locator('h1')).toContainText('Jobs')
})

test('user can apply to job', async ({ page }) => {
  await page.goto('/signin')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await page.goto('/jobs')
  await page.click('button:has-text("Apply")')
  await expect(page.locator('text=Applied')).toBeVisible()
})
```

---

## Rollback Plan

### Pre-Migration Backup

1. **Database Backup:**
```bash
# Export Supabase data
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

2. **Code Backup:**
```bash
git tag pre-migration
git push origin pre-migration
```

### Rollback Steps

1. **Revert to Previous Version:**
```bash
git checkout pre-migration
pnpm install
pnpm build
```

2. **Restore Database (if needed):**
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

3. **Deploy Previous Version:**
```bash
vercel deploy --prebuilt
```

### Rollback Triggers

- Critical bugs affecting core functionality
- Performance degradation > 50%
- Authentication failures
- Data integrity issues
- User complaints > 10% of active users

---

## Timeline & Resources

### Estimated Timeline

**Option A (Next.js + Supabase): 12 weeks**
- Phase 1: Foundation (Week 1-2)
- Phase 2: Core Pages (Week 3-4)
- Phase 3: Feature Modules (Week 5-8)
- Phase 4: Advanced Features (Week 9-10)
- Phase 5: Testing & Launch (Week 11-12)

**Option B (Next.js + Self-Managed PostgreSQL): 20+ weeks**
- Database migration (Week 1-4)
- Authentication system (Week 5-6)
- Real-time system (Week 7-8)
- File storage system (Week 9)
- Next.js setup (Week 10-12)
- Module migration (Week 13-18)
- Testing & Launch (Week 19-20)

### Required Resources

**Development Team:**
- 2 Full-stack developers (Next.js + Supabase)
- 1 Frontend developer (UI/UX migration)
- 1 Backend developer (API routes)

**Infrastructure:**
- Development environment (Vercel/Netlify)
- Staging environment
- Production environment
- Monitoring (Sentry)
- Analytics (Vercel Analytics)

### Cost Estimates

**Option A (Next.js + Supabase):**
- Development: $50,000 - $80,000
- Infrastructure: $200 - $500/month (Supabase + Vercel)
- Total: $52,600 - $86,000 (first year)

**Option B (Next.js + Self-Managed):**
- Development: $80,000 - $120,000
- Infrastructure: $500 - $1,000/month (PostgreSQL + S3 + Pusher + Vercel)
- Total: $86,000 - $132,000 (first year)

---

## Decision Matrix

| Factor | Current (Vite) | Option A (Next.js + Supabase) | Option B (Next.js + Self-Managed) |
|--------|----------------|-------------------------------|-----------------------------------|
| SEO | Poor | Excellent | Excellent |
| Performance | Good | Excellent | Excellent |
| Development Speed | Fast | Medium | Slow |
| Maintenance | Low | Medium | High |
| Cost | Low | Medium | High |
| Control | Low | Medium | High |
| Scalability | Medium | High | Very High |
| Migration Effort | N/A | Medium | Very High |
| Risk | N/A | Low | High |

---

## Recommendations

### Short-Term (Recommended)

**Migrate to Next.js + Supabase (Option A)**

**Reasons:**
- Faster migration (12 weeks vs 20+ weeks)
- Lower cost ($52K vs $86K)
- Lower risk
- Keep existing Supabase features
- Still get SSR benefits
- Can migrate to self-hosted later

### Long-Term (Optional)

**Consider Self-Managed PostgreSQL if:**
- Reaching Supabase limits
- Need custom database optimizations
- Want full control over data
- Have dedicated DevOps team
- Budget allows for additional infrastructure

---

## Next Steps

1. **Review this document** with stakeholders
2. **Choose migration option** (A or B)
3. **Set up development environment** for Next.js
4. **Create migration branch** in Git
5. **Begin Phase 1** (Foundation)
6. **Weekly progress reviews**
7. **Continuous testing**
8. **Staging deployment**
9. **Production launch**

---

## Appendix

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/nextjs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [SWR Documentation](https://swr.vercel.app)
- [Vercel Deployment Guide](https://vercel.com/docs)

### Migration Checklist

- [ ] Review and approve migration plan
- [ ] Set up Next.js development environment
- [ ] Configure Supabase for Next.js
- [ ] Set up NextAuth.js
- [ ] Create API route structure
- [ ] Migrate authentication pages
- [ ] Migrate landing pages
- [ ] Migrate user dashboards
- [ ] Migrate jobs module
- [ ] Migrate messaging system
- [ ] Migrate connections system
- [ ] Migrate notifications
- [ ] Migrate admin panel
- [ ] Migrate backer features
- [ ] Implement SEO optimization
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing
- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitor and optimize

---

**Document Version**: 1.0  
**Last Updated**: July 3, 2026  
**Status**: Planning Phase - Awaiting Stakeholder Review
