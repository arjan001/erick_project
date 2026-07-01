# Studio22 Performance Optimization Guide

**Version**: 1.0  
**Last Updated**: July 1, 2026  
**Status**: Ready for Implementation  

---

## Overview

This document outlines performance optimization strategies for Studio22, covering build optimization, runtime performance, database optimization, and user experience improvements.

### Performance Goals

- **Initial Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)
- **API Response Time**: < 200ms (p95)

---

## Build Optimization

### 1. Vite Configuration Updates

**Current**: Basic Vite config  
**Optimization**: Add performance-focused plugins and settings

Update `vite.config.js`:

```javascript
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    // Bundle analyzer
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    // Compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    })
  ],
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'charts-vendor': ['recharts'],
          'editor-vendor': ['react-quill'],
          'animation-vendor': ['framer-motion', 'canvas-confetti']
        }
      }
    },
    // Optimize chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    // Enable source maps in production for debugging
    sourcemap: false,
    // Minify CSS
    cssMinify: true,
    // Target modern browsers
    target: 'esnext'
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'framer-motion'
    ]
  }
});
```

### 2. Install Required Plugins

```bash
npm install -D rollup-plugin-visualizer vite-plugin-compression
```

### 3. Tree Shaking

**Current**: All dependencies bundled  
**Optimization**: Ensure unused code is eliminated

**Actions**:
- Verify all imports are specific (no `import * from`)
- Remove unused Base44 SDK imports
- Remove unused shadcn/ui components
- Check for unused utility functions

### 4. Code Splitting

**Current**: Single bundle  
**Optimization**: Route-based and component-based splitting

**Implementation**:
- Already using React Router lazy loading
- Add dynamic imports for heavy components:
```javascript
// Instead of:
import { HeavyChart } from '@/components/HeavyChart';

// Use:
const HeavyChart = lazy(() => import('@/components/HeavyChart'));
```

---

## Runtime Performance

### 1. React Query Optimization

**Current**: Basic configuration  
**Optimization**: Enhanced caching and deduplication

Update `src/lib/query-client.js`:

```javascript
import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});
```

### 2. Memoization

**Current**: Limited memoization  
**Optimization**: Add React.memo, useMemo, useCallback

**Priority Components**:
- `CreatorGrid` - Expensive rendering
- `JobPostingModal` - Heavy form
- `PortfolioQueue` - Large lists
- `DashboardStatCard` - Repeated renders

**Example**:
```javascript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const CreatorGrid = memo(function CreatorGrid({ creators }) {
  // Component logic
});

// Memoize expensive calculations
const sortedCreators = useMemo(() => {
  return creators.sort((a, b) => a.name.localeCompare(b.name));
}, [creators]);

// Memoize callbacks
const handleSelect = useCallback((id) => {
  onSelect(id);
}, [onSelect]);
```

### 3. Virtual Scrolling

**Current**: Full list rendering  
**Optimization**: Virtual scroll for large lists

**Implementation**:
```bash
npm install @tanstack/react-virtual
```

**Apply to**:
- Job board (100+ jobs)
- Artist/Team lists
- Message history
- Audit logs

**Example**:
```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef();
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });
  
  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <div key={virtualItem.key} style={{ height: '50px' }}>
          {items[virtualItem.index]}
        </div>
      ))}
    </div>
  );
}
```

### 4. Image Optimization

**Current**: Full-size images  
**Optimization**: Lazy loading, WebP, responsive images

**Implementation**:
```javascript
import { lazy } from 'react';

// Lazy load images
const LazyImage = lazy(() => import('@/components/LazyImage'));

// Use loading="lazy" on img tags
<img 
  src={imageUrl} 
  loading="lazy" 
  decoding="async"
  alt="Description"
/>

// Use next-gen formats (WebP, AVIF)
<picture>
  <source srcSet={imageUrlWebP} type="image/webp" />
  <source srcSet={imageUrlAVIF} type="image/avif" />
  <img src={imageUrl} alt="Description" loading="lazy" />
</picture>
```

### 5. Font Optimization

**Current**: Full font files  
**Optimization**: Subset fonts, use font-display

**Implementation**:
```css
/* In index.css or globals.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-subset.woff2') format('woff2');
  font-display: swap;
  font-weight: 400 700;
}
```

---

## Database Optimization

### 1. Supabase Query Optimization

**Current**: Basic queries  
**Optimization**: Select specific columns, use indexes

**Implementation**:
```javascript
// Instead of:
const { data } = await supabase.from('jobs').select('*');

// Use:
const { data } = await supabase.from('jobs').select('id, title, status, posted_at');

// Use count for pagination
const { data, count } = await supabase
  .from('jobs')
  .select('*', { count: 'exact', head: false })
  .range(0, 9);
```

### 2. Index Creation

**Current**: Basic indexes  
**Optimization**: Add composite indexes for common queries

**SQL to run in Supabase**:
```sql
-- Composite index for job filtering
CREATE INDEX idx_jobs_status_posted ON jobs(status, posted_at DESC);

-- Composite index for artist filtering
CREATE INDEX idx_artists_status_availability ON artists(admin_approval_status, availability_status);

-- Composite index for project filtering
CREATE INDEX idx_projects_status_owner ON projects(status, project_owner_email);

-- Index for full-text search
CREATE INDEX idx_jobs_title_gin ON jobs USING gin(to_tsvector('english', title));
```

### 3. Connection Pooling

**Current**: Default pooling  
**Optimization**: Configure connection pool

**Supabase Configuration**:
- Use Supabase Edge Functions for heavy queries
- Implement query batching
- Use prepared statements

### 4. Caching Strategy

**Current**: No caching  
**Optimization**: Implement multi-layer caching

**Implementation**:
```javascript
// React Query cache (already configured)
// Add Redis for production (optional)
// Add CDN for static assets

// Cache API responses
const cachedData = await queryClient.fetchQuery(
  ['jobs', filters],
  () => fetchJobs(filters),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  }
);
```

---

## Network Optimization

### 1. HTTP/2 and HTTP/3

**Current**: HTTP/1.1  
**Optimization**: Enable HTTP/2/3

**Implementation**:
- Supabase automatically uses HTTP/2
- Configure CDN for HTTP/2
- Enable HTTP/3 in production DNS

### 2. Prefetching

**Current**: No prefetching  
**Optimization**: Prefetch critical resources

**Implementation**:
```javascript
// Prefetch next route
import { usePrefetchQuery } from '@tanstack/react-query';

function JobCard({ jobId }) {
  const prefetchJob = usePrefetchQuery(['job', jobId], () => fetchJob(jobId));
  
  return (
    <div onMouseEnter={() => prefetchJob()}>
      {/* Job card content */}
    </div>
  );
}
```

### 3. Service Worker

**Current**: No service worker  
**Optimization**: Add PWA support

**Implementation**:
```bash
npm install -D vite-plugin-pwa
```

**Update vite.config.js**:
```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Studio22',
        short_name: 'Studio22',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

---

## Asset Optimization

### 1. CSS Optimization

**Current**: Full Tailwind CSS  
**Optimization**: Purge unused CSS

**Implementation**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  // Already configured - verify it's working
  purge: {
    enabled: true,
    content: ['./src/**/*.{js,jsx,ts,tsx}']
  }
}
```

### 2. JavaScript Minification

**Current**: Vite default  
**Optimization**: Enhanced minification

**Implementation**:
```javascript
// vite.config.js
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // Remove console logs in production
      drop_debugger: true
    }
  }
}
```

### 3. Asset Compression

**Current**: No compression  
**Optimization**: Gzip and Brotli compression

**Implementation**:
- Already added to vite.config.js
- Verify compression in nginx config

**Nginx config**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
gzip_comp_level 6;

brotli on;
brotli_types text/plain text/css application/json application/javascript;
brotli_comp_level 6;
```

---

## Monitoring and Analytics

### 1. Performance Monitoring

**Implementation**:
```bash
npm install @sentry/react
```

**Setup**:
```javascript
// src/lib/sentry.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
});
```

### 2. Web Vitals

**Implementation**:
```bash
npm install web-vitals
```

**Setup**:
```javascript
// src/lib/analytics.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

### 3. Bundle Analysis

**Implementation**:
- Already added rollup-plugin-visualizer
- Run analysis:
```bash
npm run build
# Check dist/stats.html
```

---

## Optimization Priority

### Phase 1: Quick Wins (Week 1)

1. ✅ Update vite.config.js with compression and bundle analyzer
2. ✅ Optimize React Query configuration
3. ✅ Add image lazy loading
4. ✅ Remove console logs in production
5. ✅ Enable CSS purging

### Phase 2: Medium Impact (Week 2)

1. Implement code splitting for heavy components
2. Add memoization to expensive components
3. Optimize Supabase queries (select specific columns)
4. Add database indexes
5. Implement virtual scrolling for large lists

### Phase 3: High Impact (Week 3)

1. Add service worker for PWA support
2. Implement caching strategy
3. Add performance monitoring (Sentry)
4. Optimize fonts and assets
5. Implement CDN for static assets

### Phase 4: Advanced (Week 4)

1. Implement server-side rendering (if needed)
2. Add edge functions for heavy queries
3. Implement Redis caching
4. Optimize Docker build
5. Load testing and optimization

---

## Performance Testing

### 1. Lighthouse CI

**Setup**:
```bash
npm install -D @lhci/cli
```

**Configuration**:
```javascript
// lighthouserc.json
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }]
      }
    }
  }
};
```

### 2. Load Testing

**Tools**:
- k6 for API load testing
- Artillery for web load testing

**Example k6 script**:
```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function() {
  const res = http.get('http://localhost:5173');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500
  });
}
```

### 3. Performance Budgets

**Configuration**:
```javascript
// .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: lhci autorun
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

## Expected Improvements

### Before Optimization

- Initial Load: ~4-5 seconds
- Bundle Size: ~2MB (uncompressed)
- Lighthouse Score: ~60-70
- API Response: ~300-500ms

### After Optimization

- Initial Load: < 2 seconds
- Bundle Size: < 500KB (gzipped)
- Lighthouse Score: > 90
- API Response: < 200ms

---

## Monitoring Checklist

- [ ] Bundle size after each build
- [ ] Lighthouse score in CI/CD
- [ ] API response times
- [ ] Database query performance
- [ ] User-reported performance issues
- [ ] Core Web Vitals in production

---

## Next Steps

1. Install required dependencies
2. Update vite.config.js
3. Optimize React Query configuration
4. Add lazy loading to images
5. Implement memoization for expensive components
6. Add database indexes
7. Set up performance monitoring
8. Run Lighthouse CI
9. Monitor and iterate

---

**Document Version**: 1.0  
**Last Updated**: July 1, 2026  
**Status**: Ready for Implementation
