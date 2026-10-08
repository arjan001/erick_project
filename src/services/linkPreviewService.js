/**
 * Link Preview Service
 * Fetches metadata for external URLs to generate link previews
 */

// Simple in-memory cache to avoid duplicate requests
const previewCache = new Map()

/**
 * Fetch metadata for a URL
 * Note: Due to CORS, this requires a backend proxy or only works for same-origin URLs
 * For production, use a service like LinkPreview.io, Microlink, or a backend proxy
 */
export async function fetchLinkPreview(url) {
  // Check cache first
  if (previewCache.has(url)) {
    return previewCache.get(url)
  }

  try {
    // Try to fetch if it's same-origin or if we have a proxy
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch URL')
    }

    const html = await response.text()
    const metadata = parseHtmlMetadata(html, url)

    // Cache the result
    previewCache.set(url, metadata)
    return metadata
  } catch (error) {
    // Return basic metadata if fetch fails
    const basicMetadata = {
      url,
      title: new URL(url).hostname,
      description: '',
      image: null,
      favicon: null
    }
    previewCache.set(url, basicMetadata)
    return basicMetadata
  }
}

/**
 * Parse HTML to extract meta tags
 */
function parseHtmlMetadata(html, url) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const getMetaContent = (property) => {
    const meta = doc.querySelector(`meta[property="${property}"]`) || 
                doc.querySelector(`meta[name="${property}"]`)
    return meta?.getAttribute('content') || ''
  }

  const getLink = (rel) => {
    const link = doc.querySelector(`link[rel="${rel}"]`)
    return link?.getAttribute('href') || ''
  }

  const title = doc.querySelector('title')?.textContent || new URL(url).hostname
  const description = getMetaContent('description') || getMetaContent('og:description')
  const image = getMetaContent('og:image') || getMetaContent('twitter:image')
  const favicon = getLink('icon') || getLink('shortcut icon')

  // Resolve relative URLs
  const baseUrl = new URL(url)
  const resolveUrl = (path) => {
    if (!path) return null
    try {
      return new URL(path, baseUrl).href
    } catch {
      return null
    }
  }

  return {
    url,
    title: title.substring(0, 100), // Limit title length
    description: description.substring(0, 200), // Limit description length
    image: resolveUrl(image),
    favicon: resolveUrl(favicon),
  }
}

/**
 * Generate a preview for internal links (jobs, profiles, projects)
 */
export function generateInternalPreview(type, id, data) {
  const baseUrl = window.location.origin
  
  switch (type) {
    case 'job':
      return {
        url: `${baseUrl}/gig/${id}`,
        title: data?.title || 'Gig',
        description: data?.description || `Join this gig on SmartGigs Kenya`,
        image: data?.image_url || 'https://smartgigs.co.ke/og-gig.jpg',
        favicon: `${baseUrl}/favicon.ico`,
      }
    case 'artist':
      return {
        url: `${baseUrl}/artist?id=${id}`,
        title: data?.full_name || 'Artist Profile',
        description: data?.bio || `View ${data?.full_name || 'this artist'}'s portfolio on SmartGigs Kenya`,
        image: data?.profile_image || 'https://smartgigs.co.ke/og-artist.jpg',
        favicon: `${baseUrl}/favicon.ico`,
      }
    case 'team':
      return {
        url: `${baseUrl}/team?id=${id}`,
        title: data?.team_name || 'Team Profile',
        description: data?.bio || `View ${data?.team_name || 'this team'}'s profile on SmartGigs Kenya`,
        image: data?.logo_url || 'https://smartgigs.co.ke/og-team.jpg',
        favicon: `${baseUrl}/favicon.ico`,
      }
    case 'project':
      return {
        url: `${baseUrl}/project?id=${id}`,
        title: data?.title || 'Project',
        description: data?.notes || `View this project on SmartGigs Kenya`,
        image: data?.image_url || 'https://smartgigs.co.ke/og-project.jpg`,
        favicon: `${baseUrl}/favicon.ico`,
      }
    default:
      return {
        url: `${baseUrl}`,
        title: 'SmartGigs Kenya',
        description: 'The place to get hired for theater, film, and TV',
        image: 'https://smartgigs.co.ke/og-home.jpg',
        favicon: `${baseUrl}/favicon.ico`,
      }
  }
}

/**
 * Detect if a URL is internal to the app
 */
export function isInternalUrl(url) {
  try {
    const urlObj = new URL(url)
    const currentOrigin = window.location.origin
    return urlObj.origin === currentOrigin
  } catch {
    return false
  }
}
