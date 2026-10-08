import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { RouteRenderer } from '@/app/router/RouteRenderer'
import { ToastProvider } from '@/hooks/useToast'
import { MaintenanceGuard } from '@/app/router/guards/MaintenanceGuard'
import { HelmetProvider } from 'react-helmet-async'
import CookieBanner from '@/components/CookieBanner'
import { ShopProvider } from '@/contexts/ShopContext'

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth()

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    )
  }

  // Render the main app with new RouteRenderer wrapped in MaintenanceGuard
  return (
    <MaintenanceGuard>
      <RouteRenderer />
      <CookieBanner />
    </MaintenanceGuard>
  )
}


function App() {

  return (
    <AuthProvider>
      <ShopProvider>
        <QueryClientProvider client={queryClientInstance}>
          <ToastProvider>
            <HelmetProvider>
              <Router>
                <NavigationTracker />
                <AuthenticatedApp />
              </Router>
              <Toaster />
            </HelmetProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ShopProvider>
    </AuthProvider>
  )
}

export default App
