/**
 * Sitemap Generation Service
 * Generates XML sitemap for Google and other search engines
 */

const SITE_URL = 'https://smartgigs.co.ke'

// Static pages with priority and change frequency
const STATIC_PAGES = [
  { url: '', priority: 1.0, changefreq: 'daily' },
  { url: '/SignIn', priority: 0.5, changefreq: 'monthly' },
  { url: '/SignUp', priority: 0.5, changefreq: 'monthly' },
  { url: '/talent', priority: 0.9, changefreq: 'daily' },
  { url: '/jobs', priority: 0.9, changefreq: 'daily' },
  { url: '/FindJobsPage', priority: 0.8, changefreq: 'daily' },
  { url: '/browse', priority: 0.8, changefreq: 'daily' },
]

/**
 * Generate XML sitemap
 */
export function generateSitemap(dynamicUrls = []) {
  const urls = [...STATIC_PAGES, ...dynamicUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `
  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`

  return xml
}

/**
 * Generate sitemap for Supabase entities
 */
export async function generateEntitySitemap() {
  // This would fetch dynamic pages from Supabase
  // For now, return static pages only
  return generateSitemap()
}

/**
 * Download sitemap as XML file
 */
export function downloadSitemap(sitemapXml, filename = 'sitemap.xml') {
  const blob = new Blob([sitemapXml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate robots.txt
 */
export function generateRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
}

/**
 * Download robots.txt
 */
export function downloadRobotsTxt(filename = 'robots.txt') {
  const robotsTxt = generateRobotsTxt()
  const blob = new Blob([robotsTxt], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
