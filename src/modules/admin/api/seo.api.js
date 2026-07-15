import { base44 } from '@/api/base44Client';

/**
 * SEO Settings API
 */

// Get global SEO settings
export const getSeoSettings = async () => {
  try {
    const { data, error } = await base44.entities.seo_settings.list();
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    throw error;
  }
};

// Update global SEO settings
export const updateSeoSettings = async (settings) => {
  try {
    const existing = await getSeoSettings();
    if (existing) {
      const { data, error } = await base44.entities.seo_settings.update(existing.id, settings);
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await base44.entities.seo_settings.create(settings);
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    throw error;
  }
};

/**
 * Page Metadata API
 */

// Get all page metadata
export const getPageMetadata = async () => {
  try {
    const { data, error } = await base44.entities.page_seo_metadata.list();
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching page metadata:', error);
    throw error;
  }
};

// Get single page metadata by slug
export const getPageMetadataBySlug = async (slug) => {
  try {
    const { data, error } = await base44.entities.page_seo_metadata.filter({ page_slug: slug });
    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching page metadata by slug:', error);
    throw error;
  }
};

// Update page metadata
export const updatePageMetadata = async (id, metadata) => {
  try {
    const { data, error } = await base44.entities.page_seo_metadata.update(id, metadata);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating page metadata:', error);
    throw error;
  }
};

// Create page metadata
export const createPageMetadata = async (metadata) => {
  try {
    const { data, error } = await base44.entities.page_seo_metadata.create(metadata);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating page metadata:', error);
    throw error;
  }
};

/**
 * Sitemap Generation API
 */

// Generate sitemap XML
export const generateSitemap = async () => {
  try {
    const seoSettings = await getSeoSettings();
    const pageMetadata = await getPageMetadata();
    
    if (!seoSettings?.sitemap_enabled) {
      throw new Error('Sitemap generation is disabled');
    }

    const baseUrl = seoSettings.canonical_url || 'https://studio22.com';
    const defaultPriority = seoSettings.sitemap_priority || 0.8;
    const defaultChangeFreq = seoSettings.sitemap_change_freq || 'weekly';

    // Filter out no-index pages
    const indexedPages = pageMetadata.filter(page => !page.no_index);

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    indexedPages.forEach(page => {
      const url = page.canonical_url || `${baseUrl}${page.page_slug}`;
      const priority = page.sitemap_priority || defaultPriority;
      const changeFreq = page.sitemap_change_freq || defaultChangeFreq;
      const lastMod = page.updated_at || page.created_at;

      xml += `  <url>\n`;
      xml += `    <loc>${url}</loc>\n`;
      xml += `    <lastmod>${new Date(lastMod).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>${changeFreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    // Log generation
    await logSitemapGeneration('success', indexedPages.length, xml.length);

    return xml;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    await logSitemapGeneration('failed', 0, 0, error.message);
    throw error;
  }
};

// Log sitemap generation
const logSitemapGeneration = async (status, urlCount, fileSize, errorMessage = null) => {
  try {
    await base44.entities.sitemap_generation_log.create({
      status,
      url_count: urlCount,
      file_size_bytes: fileSize,
      error_message: errorMessage,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging sitemap generation:', error);
  }
};

// Get sitemap generation logs
export const getSitemapLogs = async (limit = 10) => {
  try {
    const { data, error } = await base44.entities.sitemap_generation_log.list(
      {},
      '-created_at',
      limit
    );
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sitemap logs:', error);
    throw error;
  }
};

/**
 * Robots.txt API
 */

// Get robots.txt content
export const getRobotsTxt = async () => {
  try {
    const seoSettings = await getSeoSettings();
    return seoSettings?.robots_txt || 'User-agent: *\nAllow: /';
  } catch (error) {
    console.error('Error fetching robots.txt:', error);
    throw error;
  }
};

/**
 * Schema.org JSON-LD API
 */

// Generate JSON-LD schema for a page
export const generateSchemaForPage = async (slug) => {
  try {
    const seoSettings = await getSeoSettings();
    const pageMetadata = await getPageMetadataBySlug(slug);

    if (!seoSettings?.enable_schema) {
      return null;
    }

    const baseUrl = seoSettings.canonical_url || 'https://studio22.com';
    const pageUrl = pageMetadata?.canonical_url || `${baseUrl}${slug}`;

    // Organization schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: seoSettings.organization_name || 'Studio22',
      url: seoSettings.organization_url || baseUrl,
      logo: seoSettings.organization_logo || '',
      sameAs: seoSettings.same_as || []
    };

    // WebPage schema
    const webPageSchema = {
      '@context': 'https://schema.org',
      '@type': pageMetadata?.schema_type || 'WebPage',
      name: pageMetadata?.meta_title || seoSettings.site_title,
      description: pageMetadata?.meta_description || seoSettings.site_description,
      url: pageUrl,
      inLanguage: seoSettings.og_locale || 'en_US'
    };

    // Combine schemas
    const schema = [organizationSchema, webPageSchema];

    // Add page-specific schema if exists
    if (pageMetadata?.schema_data && Object.keys(pageMetadata.schema_data).length > 0) {
      schema.push(pageMetadata.schema_data);
    }

    return JSON.stringify(schema);
  } catch (error) {
    console.error('Error generating schema:', error);
    throw error;
  }
};
