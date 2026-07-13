import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { RouteRenderer } from '@/app/router/RouteRenderer';
import { ToastProvider } from '@/hooks/useToast';
import { MaintenanceGuard } from '@/app/router/guards/MaintenanceGuard';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render the main app with new RouteRenderer wrapped in MaintenanceGuard
  return (
    <MaintenanceGuard>
      <RouteRenderer />
    </MaintenanceGuard>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ToastProvider>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
