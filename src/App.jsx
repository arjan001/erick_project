import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import AuthRedirectHandler from '@/components/AuthRedirectHandler'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { RouteRenderer } from '@/app/router/RouteRenderer'
import { ToastProvider } from '@/hooks/useToast'
import { MaintenanceGuard } from '@/app/router/guards/MaintenanceGuard'
import { HelmetProvider } from 'react-helmet-async'
import CookieBanner from '@/components/CookieBanner'
import { ShopProvider } from '@/contexts/ShopContext'
import ErrorBoundary from '@/components/ErrorBoundary'

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth()

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 font-medium">Loading SmartGigs Kenya...</p>
        </div>
      </div>
    )
  }

  // Render the main app with RouteRenderer
  return (
    // <MaintenanceGuard>
    <RouteRenderer />
    // </MaintenanceGuard>
  )
}


function App() {

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <HelmetProvider>
              <Router>
                <NavigationTracker />
                <AuthRedirectHandler />
                <ShopProvider>
                  <AuthenticatedApp />
                </ShopProvider>
              </Router>
              <Toaster />
            </HelmetProvider>
          </QueryClientProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
