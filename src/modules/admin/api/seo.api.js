import { supabase } from '@/lib/supabase'

/**
 * SEO Settings API
 */

// Get global SEO settings
export const getSeoSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    throw error
  }
}

// Update global SEO settings
export const updateSeoSettings = async (settings) => {
  try {
    const existing = await getSeoSettings()
    if (existing) {
      const { data, error } = await supabase
        .from('seo_settings')
        .update(settings)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      return data
    } else {
      const { data, error } = await supabase
        .from('seo_settings')
        .insert(settings)
        .select()
        .single()
      if (error) throw error
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
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (error) {
    throw error
  }
}

// Get single page metadata by slug
export const getPageMetadataBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  } catch (error) {
    throw error
  }
}

// Update page metadata
export const updatePageMetadata = async (id, metadata) => {
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .update(metadata)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Create page metadata
export const createPageMetadata = async (metadata) => {
  try {
    const { data, error } = await supabase
      .from('cms_pages')
      .insert(metadata)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (error) {
    throw error
  }
}

// Delete page metadata
export const deletePageMetadata = async (id) => {
  try {
    const { error } = await supabase
      .from('cms_pages')
      .delete()
      .eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    throw error
  }
}

/**
 * Sitemap Generation API
 */

// Generate sitemap data (returns array of pages, not XML)
export const generateSitemap = async () => {
  try {
    const seoSettings = await getSeoSettings()
    const pageMetadata = await getPageMetadata()

    if (!seoSettings?.sitemap_enabled) {
      throw new Error('Sitemap generation is disabled')
    }

    // Generate sitemap data from page metadata
    const pages = pageMetadata.map(page => ({
      url: page.slug,
      priority: page.sitemap_priority || 0.8,
      changefreq: page.sitemap_change_freq || 'weekly'
    }))

    return pages
  } catch (error) {
    throw error
  }
}

/**
 * Schema.org Generation API
 */

// Generate schema for a page
export const generateSchemaForPage = async (slug) => {
  try {
    const pageData = await getPageMetadataBySlug(slug)
    const seoSettings = await getSeoSettings()

    if (!seoSettings?.enable_schema) {
      return null
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageData?.meta_title || seoSettings?.site_title || 'SmartGigs Kenya',
      description: pageData?.meta_description || seoSettings?.site_description,
      url: `${seoSettings?.canonical_url || 'https://smartgigs.co.ke'}${slug}`
    }

    return JSON.stringify(schema)
  } catch (error) {
    throw error
  }
}
