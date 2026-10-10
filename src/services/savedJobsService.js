import { supabase } from '@/lib/supabase'
import { SavedJob } from '@/lib/supabaseEntities'

/**
 * Save a job or role for the current user
 */
export async function saveJob(jobId, jobRoleId = null) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Save to localStorage for non-authenticated users
    const saved = JSON.parse(localStorage.getItem('smartgigs_saved_jobs') || '[]')
    const exists = saved.find(j => j.jobId === jobId && j.jobRoleId === jobRoleId)
    if (!exists) {
      saved.push({ jobId, jobRoleId, savedAt: new Date().toISOString() })
      localStorage.setItem('smartgigs_saved_jobs', JSON.stringify(saved))
    }
    return { success: true, fromLocalStorage: true }
  }

  // For authenticated users, save to Supabase
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .upsert({
        user_id: user.id,
        job_id: jobId,
        job_role_id: jobRoleId,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data, fromLocalStorage: false }
  } catch (error) {
    console.error('Error saving job:', error)
    return { success: false, error }
  }
}

/**
 * Remove a saved job or role
 */
export async function unsaveJob(jobId, jobRoleId = null) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Remove from localStorage
    const saved = JSON.parse(localStorage.getItem('smartgigs_saved_jobs') || '[]')
    const filtered = saved.filter(j => !(j.jobId === jobId && j.jobRoleId === jobRoleId))
    localStorage.setItem('smartgigs_saved_jobs', JSON.stringify(filtered))
    return { success: true, fromLocalStorage: true }
  }

  // For authenticated users, remove from Supabase
  try {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .if('job_role_id', jobRoleId, jobRoleId === null)

    if (error) throw error
    return { success: true, fromLocalStorage: false }
  } catch (error) {
    console.error('Error unsaving job:', error)
    return { success: false, error }
  }
}

/**
 * Get all saved jobs for the current user
 */
export async function getSavedJobs() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Return from localStorage
    return JSON.parse(localStorage.getItem('smartgigs_saved_jobs') || '[]')
  }

  // For authenticated users, fetch from Supabase
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job:jobs(*),
        job_role:job_roles(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching saved jobs:', error)
    return []
  }
}

/**
 * Check if a job is saved
 */
export async function isJobSaved(jobId, jobRoleId = null) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Check localStorage
    const saved = JSON.parse(localStorage.getItem('smartgigs_saved_jobs') || '[]')
    return saved.some(j => j.jobId === jobId && j.jobRoleId === jobRoleId)
  }

  // For authenticated users, check Supabase
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .if('job_role_id', jobRoleId, jobRoleId === null)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  } catch (error) {
    console.error('Error checking saved job:', error)
    return false
  }
}

/**
 * Save pending application data for redirect after login
 */
export function savePendingApplication(jobId, jobRoleId = null, jobTitle = '', roleTitle = '') {
  localStorage.setItem('smartgigs_pending_application', JSON.stringify({
    jobId,
    jobRoleId,
    jobTitle,
    roleTitle,
    timestamp: new Date().toISOString()
  }))
}

/**
 * Get pending application data
 */
export function getPendingApplication() {
  const data = localStorage.getItem('smartgigs_pending_application')
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * Clear pending application data
 */
export function clearPendingApplication() {
  localStorage.removeItem('smartgigs_pending_application')
}
