/**
 * Application Ranking Engine
 * Ranks applicants based on multiple factors to find the best fit for a job/project
 */

export class ApplicationRankingEngine {
  constructor(jobRequirements = {}) {
    this.jobRequirements = jobRequirements
    this.weights = {
      skillsMatch: 0.35,
      experience: 0.20,
      locationMatch: 0.15,
      portfolioQuality: 0.15,
      roleMatch: 0.10,
      availability: 0.05
    }
  }

  /**
   * Calculate match score for a single applicant
   * @param {Object} applicant - Artist or team profile
   * @param {Object} application - Application details
   * @returns {Object} Score and breakdown
   */
  calculateScore(applicant, application) {
    const scores = {
      skillsMatch: this.calculateSkillsMatch(applicant),
      experience: this.calculateExperienceScore(applicant),
      locationMatch: this.calculateLocationMatch(applicant),
      portfolioQuality: this.calculatePortfolioScore(applicant),
      roleMatch: this.calculateRoleMatch(applicant),
      availability: this.calculateAvailabilityScore(applicant)
    }

    const总分 = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * (this.weights[key] || 0))
    }, 0)

    return {
      totalScore: Math.round(总分 * 100),
      breakdown: scores,
      rank: 0 // Will be set after sorting
    }
  }

  /**
   * Calculate skills match score (0-1)
   */
  calculateSkillsMatch(applicant) {
    if (!this.jobRequirements.required_skills || this.jobRequirements.required_skills.length === 0) {
      return 0.5; // Neutral score if no requirements
    }

    const applicantSkills = applicant.skills_experience?.map(s => s.skill.toLowerCase()) || []
    const requiredSkills = this.jobRequirements.required_skills.map(s => s.toLowerCase())

    if (applicantSkills.length === 0) return 0

    const matches = requiredSkills.filter(skill => 
      applicantSkills.some(appSkill => appSkill.includes(skill) || skill.includes(appSkill))
    )

    return matches.length / requiredSkills.length
  }

  /**
   * Calculate experience score (0-1)
   */
  calculateExperienceScore(applicant) {
    const years = applicant.years_of_experience || 0
    const required = this.jobRequirements.min_years_experience || 0

    if (years >= required) return 1
    if (required === 0) return Math.min(years / 5, 1); // Cap at 5 years if no requirement
    return years / required
  }

  /**
   * Calculate location match score (0-1)
   */
  calculateLocationMatch(applicant) {
    const jobLocation = this.jobRequirements.location?.toLowerCase() || ''
    const jobCity = this.jobRequirements.location_city?.toLowerCase() || ''
    const jobCountry = this.jobRequirements.location_country?.toLowerCase() || ''
    const isRemote = this.jobRequirements.is_remote || false

    const applicantCity = applicant.based_in_city?.toLowerCase() || ''
    const applicantCountry = applicant.based_in_country?.toLowerCase() || ''

    if (isRemote) return 1; // Location doesn't matter for remote jobs

    if (jobCountry && applicantCountry) {
      if (jobCountry === applicantCountry) {
        if (jobCity && applicantCity && jobCity === applicantCity) {
          return 1; // Perfect match
        }
        return 0.8; // Same country, different city
      }
    }

    return 0.3; // Low score for location mismatch
  }

  /**
   * Calculate portfolio quality score (0-1)
   */
  calculatePortfolioScore(applicant) {
    const portfolio = applicant.portfolio_clips || []
    
    if (portfolio.length === 0) return 0.2

    // Score based on:
    // - Number of clips (more is better, up to a point)
    // - Whether clips are approved
    // - Variety of project types
    const clipCount = Math.min(portfolio.length / 10, 1); // Cap at 10 clips
    const approvedRatio = portfolio.filter(c => c.status === 'approved').length / portfolio.length
    const projectTypes = new Set(portfolio.map(c => c.project_type)).size
    const varietyScore = Math.min(projectTypes / 5, 1); // Cap at 5 different types

    return (clipCount * 0.4) + (approvedRatio * 0.3) + (varietyScore * 0.3)
  }

  /**
   * Calculate role match score (0-1)
   */
  calculateRoleMatch(applicant) {
    if (!this.jobRequirements.job_type || !applicant.roles) return 0.5

    const jobRole = this.jobRequirements.job_type.toLowerCase()
    const applicantRoles = applicant.roles.map(r => r.toLowerCase())

    if (applicantRoles.includes(jobRole)) return 1

    // Check for similar roles
    const similarRoles = {
      'director': ['producer', 'assistant_director'],
      'producer': ['director', 'line_producer'],
      'cinematographer': ['director_of_photography', 'camera_operator'],
      'editor': ['assistant_editor', 'post_production'],
      'sound': ['sound_engineer', 'sound_designer']
    }

    const similar = similarRoles[jobRole] || []
    const hasSimilar = applicantRoles.some(role => similar.includes(role))

    return hasSimilar ? 0.7 : 0.3
  }

  /**
   * Calculate availability score (0-1)
   */
  calculateAvailabilityScore(applicant) {
    const availability = applicant.availability_status?.toLowerCase() || ''

    if (availability === 'available') return 1
    if (availability === 'partially_available') return 0.6
    if (availability === 'busy') return 0.2
    return 0.5; // Unknown
  }

  /**
   * Rank multiple applications
   * @param {Array} applicationsWithProfiles - Array of {application, profile}
   * @returns {Array} Ranked applications with scores
   */
  rankApplications(applicationsWithProfiles) {
    const scored = applicationsWithProfiles.map(({ application, profile, type }) => {
      const score = this.calculateScore(profile, application)
      return {
        application,
        profile,
        type, // 'artist' or 'team'
        ...score
      }
    })

    // Sort by total score descending
    scored.sort((a, b) => b.totalScore - a.totalScore)

    // Assign ranks
    scored.forEach((item, index) => {
      item.rank = index + 1
    })

    return scored
  }

  /**
   * Get best fit candidates (top N)
   */
  getBestFit(applicationsWithProfiles, count = 5) {
    const ranked = this.rankApplications(applicationsWithProfiles)
    return ranked.slice(0, count)
  }

  /**
   * Filter applications by minimum score threshold
   */
  filterByScore(applicationsWithProfiles, minScore = 60) {
    const ranked = this.rankApplications(applicationsWithProfiles)
    return ranked.filter(item => item.totalScore >= minScore)
  }

  /**
   * Get ranking explanation for a single applicant
   */
  getRankingExplanation(scoreData) {
    const explanations = []
    const { breakdown, totalScore } = scoreData

    if (breakdown.skillsMatch > 0.8) {
      explanations.push('Strong skills match')
    } else if (breakdown.skillsMatch < 0.4) {
      explanations.push('Limited skills match')
    }

    if (breakdown.experience > 0.8) {
      explanations.push('Highly experienced')
    } else if (breakdown.experience < 0.4) {
      explanations.push('Limited experience')
    }

    if (breakdown.locationMatch > 0.8) {
      explanations.push('Great location fit')
    } else if (breakdown.locationMatch < 0.4) {
      explanations.push('Location mismatch')
    }

    if (breakdown.portfolioQuality > 0.7) {
      explanations.push('Strong portfolio')
    } else if (breakdown.portfolioQuality < 0.4) {
      explanations.push('Limited portfolio')
    }

    if (breakdown.availability > 0.8) {
      explanations.push('Currently available')
    } else if (breakdown.availability < 0.4) {
      explanations.push('Limited availability')
    }

    return {
      score: totalScore,
      explanations,
      isTopCandidate: totalScore >= 75,
      isGoodFit: totalScore >= 60
    }
  }
}

export default ApplicationRankingEngine
