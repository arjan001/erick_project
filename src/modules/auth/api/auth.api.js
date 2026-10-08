export const authApi = {
  getSession: async () => {
    const stored = localStorage.getItem('ericrabar_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        return {
          user,
          source: 'demo'
        }
      } catch (error) {
        return null
      }
    }
    return null
  },
  
  login: async (credentials) => {
    const demoAccounts = {
      'artist@artist.com': { role: 'artist', name: 'Alex Chen' },
      'team@team.com': { role: 'team', name: 'Studio Team' },
      'client@client.com': { role: 'client', name: 'Client User' },
      'project@project.com': { role: 'project_owner', name: 'Jane Smith' },
      'backer@backer.com': { role: 'backer', name: 'Investment Group' },
      'admin@ericrabar.com': { role: 'admin', name: 'Admin User' }
    }
    
    const { email, password } = credentials
    if (demoAccounts[email] && password === email) {
      const account = demoAccounts[email]
      const user = {
        id: email,
        email,
        full_name: account.name,
        role: account.role
      }
      localStorage.setItem('ericrabar_user', JSON.stringify(user))
      sessionStorage.setItem('ericrabar_just_logged_in', 'true')
      return {
        user,
        source: 'demo'
      }
    }
    
    throw new Error('Invalid credentials')
  },
  
  logout: (shouldRedirect = true) => {
    localStorage.removeItem('ericrabar_user')
    localStorage.removeItem('ericrabar_team')
    if (shouldRedirect) {
      window.location.href = '/SignIn'
    }
  },

  redirectToLogin: (returnUrl) => {
    window.location.href = '/SignIn'
  }
}