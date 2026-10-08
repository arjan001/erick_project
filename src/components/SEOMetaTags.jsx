import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

const SEOMetaTags = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  noIndex = false,
  canonicalUrl,
  schemaType = 'WebPage',
  schemaData = {},
  authorName = 'edwin nyongesa',
  authorEmail = 'arjanky@mail.com',
  authorWebsite = 'oneplusafrica.com',
  authorLinkedIn = 'https://ke.linkedin.com/in/edwin-nyongesa-770658230'
}) => {
  const location = useLocation()
  const [seoData, setSeoData] = React.useState(null)
  const [pageData, setPageData] = React.useState(null)
  const [schemaJson, setSchemaJson] = React.useState(null)

  React.useEffect(() => {
    const loadSEOData = async () => {
      try {
        // Dynamically import SEO API to avoid breaking if tables don't exist
        const seoApi = await import('@/modules/admin/api/seo.api')
        const [settings, pageMetadata, schema] = await Promise.all([
          seoApi.getSeoSettings().catch(() => null),
          seoApi.getPageMetadataBySlug(location.pathname).catch(() => null),
          seoApi.generateSchemaForPage(location.pathname).catch(() => null)
        ])
        setSeoData(settings)
        setPageData(pageMetadata)
        setSchemaJson(schema)
      } catch (error) {
        
        // Silently fail - don't break the page
      }
    }
    loadSEOData()
  }, [location.pathname])

  // Use props if provided, otherwise fall back to database data
  const pageTitle = title || pageData?.meta_title || seoData?.site_title || 'SmartGigs Kenya'
  const pageDescription = description || pageData?.meta_description || seoData?.site_description || ''
  const pageKeywords = keywords || pageData?.meta_keywords || seoData?.site_keywords || ''
  const pageOgImage = ogImage || pageData?.og_image || seoData?.og_image || ''
  const pageOgType = ogType || pageData?.og_type || seoData?.og_type || 'website'
  const pageOgLocale = seoData?.og_locale || 'en_US'
  const pageCanonical = canonicalUrl || pageData?.canonical_url || seoData?.canonical_url || ''
  const pageNoIndex = noIndex || pageData?.no_index || false
  const twitterCard = seoData?.twitter_card || 'summary_large_image'
  const twitterSite = seoData?.twitter_site || ''
  const twitterCreator = seoData?.twitter_creator || ''
  const twitterImage = seoData?.twitter_image || pageOgImage || ''

  // Build canonical URL
  const fullCanonical = pageCanonical || `${window.location.origin}${location.pathname}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}

      {/* Author Meta Tags */}
      <meta name="author" content={authorName} />
      <meta name="author-email" content={authorEmail} />
      <meta name="author-website" content={authorWebsite} />
      <meta name="author-linkedin" content={authorLinkedIn} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Robots */}
      {pageNoIndex && <meta name="robots" content="noindex, nofollow" />}
      {!pageNoIndex && <meta name="robots" content="index, follow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={pageOgType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageOgImage && <meta property="og:image" content={pageOgImage} />}
      <meta property="og:locale" content={pageOgLocale} />
      <meta property="og:site_name" content="SmartGigs Kenya" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

      {/* Theme Color */}
      <meta name="theme-color" content="#000000" />

      {/* JSON-LD Schema */}
      {schemaJson && (
        <script type="application/ld+json">
          {schemaJson}
        </script>
      )}

      {/* Organization Schema for Publisher */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OnePlus Africa Tech Solution',
          url: authorWebsite,
          logo: 'https://smartgigskenya.com/logo.png',
          contactPoint: {
            '@type': 'ContactPoint',
            email: authorEmail,
            contactType: 'customer service'
          },
          sameAs: [
            authorLinkedIn
          ],
          founder: {
            '@type': 'Person',
            name: authorName,
            sameAs: authorLinkedIn
          }
        })}
      </script>

      {/* Custom schema data if provided */}
      {Object.keys(schemaData).length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': schemaType,
            ...schemaData
          })}
        </script>
      )}
    </Helmet>
  )
}

export default SEOMetaTags
