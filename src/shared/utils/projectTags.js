// Utility functions for dynamic project tags
// Tags: Featured (manual), Popular (budget-based), New (time-based)

/**
 * Check if a project is new (created within last 24 hours)
 * @param {string} createdAt - ISO date string
 * @returns {boolean}
 */
export const isNewProject = (createdAt) => {
  if (!createdAt) return false
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  return new Date(createdAt) > oneDayAgo
}

/**
 * Check if a project is popular (budget >= $50,000)
 * @param {number|string} budget - Project budget
 * @returns {boolean}
 */
export const isPopularProject = (budget) => {
  if (!budget) return false
  const budgetNum = parseFloat(budget)
  return budgetNum >= 50000
}

/**
 * Get all applicable tags for a project
 * @param {Object} project - Project object
 * @returns {Array} Array of tag objects { id, label, icon, color }
 */
export const getProjectTags = (project) => {
  const tags = []

  if (project.is_featured) {
    tags.push({
      id: 'featured',
      label: 'Featured',
      icon: 'Star',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    })
  }

  if (isPopularProject(project.budget)) {
    tags.push({
      id: 'popular',
      label: 'Popular',
      icon: 'Flame',
      color: 'bg-orange-100 text-orange-800 border-orange-200'
    })
  }

  if (isNewProject(project.created_at)) {
    tags.push({
      id: 'new',
      label: 'New',
      icon: 'Sparkles',
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    })
  }

  if (project.open_to_backing) {
    tags.push({
      id: 'backing',
      label: 'Seeking Backing',
      icon: 'DollarSign',
      color: 'bg-green-100 text-green-800 border-green-200'
    })
  }

  return tags
}
