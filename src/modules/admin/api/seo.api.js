import { SeoSettings, PageSeoMetadata, SitemapGenerationLog } from '@/lib/supabaseEntities'

/**
 * SEO Settings API
 */

// Get global SEO settings
export const getSeoSettings = async () => {
  try {
    const data = await SeoSettings.list('-created_at', 1)
    return data?.[0] || null
  } catch (error) {
    throw error
  }
}

// Update global SEO settings
export const updateSeoSettings = async (settings) => {
  try {
    const existing = await getSeoSettings()
    if (existing) {
      const data = await SeoSettings.update(existing.id, settings)
      return data
    } else {
      const data = await SeoSettings.create(settings)
      return data
    }
  } catch (error) {
    throw error
  }
}

/**
 * Page Metadata API
 */

// Get all page metadata
export const getPageMetadata = async () => {
  try {
    const data = await PageSeoMetadata.list()
    return data || []
  } catch (error) {
    throw error
  }
}

// Get single page metadata by slug
export const getPageMetadataBySlug = async (slug) => {
  try {
    const data = await PageSeoMetadata.filter({ page_slug: slug })
    return data?.[0] || null
  } catch (error) {
    throw error
  }
}

// Update page metadata
export const updatePageMetadata = async (id, metadata) => {
  try {
    const data = await PageSeoMetadata.update(id, metadata)
    return data
  } catch (error) {
    throw error
  }
}

// Create page metadata
export const createPageMetadata = async (metadata) => {
  try {
    const data = await PageSeoMetadata.create(metadata)
    return data
  } catch (error) {
    throw error
  }
}

// Delete page metadata
export const deletePageMetadata = async (id) => {
  try {
    const data = await PageSeoMetadata.delete(id)
    return data
  } catch (error) {
    throw error
  }
}

/**
 * Sitemap Generation API
 */

// Generate sitemap XML
export const generateSitemap = async () => {
  try {
    const seoSettings = await getSeoSettings()
    const pageMetadata = await getPageMetadata()

    if (!seoSettings?.sitemap_enabled) {
      throw new Error('Sitemap generation is disabled')
    }

    const baseUrl = seoSettings.canonical_url || 'https://smartgigs.co.ke'
    const defaultPriority = seoSettings.sitemap_priority || 0.8
    const defaultChangeFreq = seoSettings.sitemap_change_freq || 'weekly'

    const indexedPages = pageMetadata.filter(page => !page.no_index)

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

    indexedPages.forEach(page => {
      const url = page.canonical_url || `${baseUrl}${page.page_slug}`
      const priority = page.sitemap_priority || defaultPriority
      const changeFreq = page.sitemap_change_freq || defaultChangeFreq
      const lastMod = page.updated_at || page.created_at

      xml += `  <url>\n`
      xml += `    <loc>${url}</loc>\n`
      xml += `    <lastmod>${new Date(lastMod).toISOString()}</lastmod>\n`
      xml += `    <changefreq>${changeFreq}</changefreq>\n`
      xml += `    <priority>${priority}</priority>\n`
      xml += `  </url>\n`
    })

    xml += `</urlset>`

    await logSitemapGeneration('success', indexedPages.length, xml.length)

    return xml
  } catch (error) {
    await logSitemapGeneration('failed', 0, 0, error.message)
    throw error
  }
}

// Log sitemap generation
const logSitemapGeneration = async (status, urlCount, fileSize, errorMessage = null) => {
  try {
    await SitemapGenerationLog.create({
      status,
      url_count: urlCount,
      file_size_bytes: fileSize,
      error_message: errorMessage,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    })
  } catch (error) {
  }
}

// Get sitemap generation logs
export const getSitemapLogs = async (limit = 10) => {
  try {
    const data = await SitemapGenerationLog.list('-created_at', limit)
    return data || []
  } catch (error) {
    throw error
  }
}

/**
 * Robots.txt API
 */

// Get robots.txt content
export const getRobotsTxt = async () => {
  try {
    const seoSettings = await getSeoSettings()
    return seoSettings?.robots_txt || 'User-agent: *\nAllow: /'
  } catch (error) {
    throw error
  }
}

/**
 * Schema.org JSON-LD API
 */

// Generate JSON-LD schema for a page
export const generateSchemaForPage = async (slug) => {
  try {
    const seoSettings = await getSeoSettings()
    const pageMetadata = await getPageMetadataBySlug(slug)

    if (!seoSettings?.enable_schema) {
      return null
    }

    const baseUrl = seoSettings.canonical_url || 'https://smartgigs.co.ke'
    const pageUrl = pageMetadata?.canonical_url || `${baseUrl}${slug}`

    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: seoSettings.organization_name || 'SmartGigs Kenya',
      url: seoSettings.organization_url || baseUrl,
      logo: seoSettings.organization_logo || '',
      sameAs: seoSettings.same_as || []
    }

    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': pageMetadata?.schema_type || 'WebPage',
      name: pageMetadata?.meta_title || seoSettings.site_title,
      description: pageMetadata?.meta_description || seoSettings.site_description,
      url: pageUrl,
      inLanguage: seoSettings.og_locale || 'en_US'
    }

    const schema = [organizationSchema, webPageSchema]

    if (pageMetadata?.schema_data && Object.keys(pageMetadata.schema_data).length > 0) {
      schema.push(pageMetadata.schema_data)
    }

    return JSON.stringify(schema)
  } catch (error) {
    throw error
  }
}
