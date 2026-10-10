// Partner Logo Service - Supabase-based storage for partner logos
import { Partner } from '@/lib/supabaseEntities'

export async function listPartnerLogos() {
  try {
    const partners = await Partner.filter({ status: 'active', featured: true }, 'name', 50)
    return (partners || []).filter(p => p.logo_url).map(p => ({
      id: p.id,
      name: p.name,
      logo_url: p.logo_url,
      website: p.website,
    }))
  } catch (err) {
    console.error('Error fetching partner logos:', err)
    return []
  }
}

export async function getPartnerLogos() {
  return await listPartnerLogos()
}
