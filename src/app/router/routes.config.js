import MainLayout from '@/layouts/MainLayout';
import AdminLayout from '@/layouts/AdminLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AuthLayout from '@/layouts/AuthLayout';
import { AuthGuard } from '@/app/router/guards/AuthGuard';
import { RoleGuard, createRoleGuard } from '@/app/router/guards/RoleGuard';
import { GuestGuard } from '@/app/router/guards/GuestGuard';

// Create role-specific guard components
const AdminGuard = createRoleGuard(['admin']);
const ArtistAdminGuard = createRoleGuard(['admin', 'artist_admin', 'artist']);
const TeamAdminGuard = createRoleGuard(['admin', 'team_admin', 'team']);
const ProjectAdminGuard = createRoleGuard(['admin', 'project_admin']);
const ArtistGuard = createRoleGuard(['artist', 'artist_admin']);
const ClientGuard = createRoleGuard(['client', 'project_owner']);
const TeamGuard = createRoleGuard(['team', 'team_admin']);
const BackerGuard = createRoleGuard(['backer']);

// Public pages (no auth required)
const publicRoutes = [
  {
    path: '/',
    component: () => import('@/pages/Home'),
    layout: MainLayout,
    exact: true
  },
  {
    path: '/Projects',
    component: () => import('@/modules/projects/pages/ProjectsPage'),
    layout: MainLayout
  },
  {
    path: '/ApplyArtist',
    component: () => import('@/pages/ApplyArtist'),
    layout: MainLayout
  },
  {
    path: '/ApplyTeam',
    component: () => import('@/pages/ApplyTeam'),
    layout: MainLayout
  },
  {
    path: '/ApplyBacker',
    component: () => import('@/pages/ApplyBacker'),
    layout: MainLayout
  },
  {
    path: '/SubmitProject',
    component: () => import('@/pages/SubmitProject'),
    layout: MainLayout
  },
  {
    path: '/BackedProjects',
    component: () => import('@/pages/BackedProjects'),
    layout: MainLayout
  },
  {
    path: '/HowBackingWorks',
    component: () => import('@/pages/HowBackingWorks'),
    layout: MainLayout
  },
  {
    path: '/Services',
    component: () => import('@/pages/Services'),
    layout: MainLayout
  },
  {
    path: '/Work',
    component: () => import('@/pages/Work'),
    layout: MainLayout
  }
];

// Auth pages (guest only - redirect if logged in)
const authRoutes = [
  {
    path: '/SignIn',
    component: () => import('@/pages/SignIn'),
    layout: AuthLayout,
    guard: GuestGuard
  }
];

// Admin routes (admin role only)
const adminRoutes = [
  {
    path: '/Admin',
    component: () => import('@/modules/admin/pages/AdminDashboardPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/ArtistAdmin',
    component: () => import('@/modules/admin/pages/ArtistAdminPage'),
    layout: AdminLayout,
    guard: ArtistAdminGuard
  },
  {
    path: '/TeamAdmin',
    component: () => import('@/modules/admin/pages/TeamAdminPage'),
    layout: AdminLayout,
    guard: TeamAdminGuard
  },
  {
    path: '/ProjectAdmin',
    component: () => import('@/modules/admin/pages/ProjectAdminPage'),
    layout: AdminLayout,
    guard: ProjectAdminGuard
  },
  {
    path: '/Admin/UserManagement',
    component: () => import('@/modules/admin/pages/AdminUserManagementPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/RolesPermissions',
    component: () => import('@/modules/admin/pages/AdminRolesPermissionsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/GeneralSettings',
    component: () => import('@/modules/admin/pages/AdminGeneralSettingsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/SEOCMS',
    component: () => import('@/modules/admin/pages/AdminSEOCMSPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/ImageStorage',
    component: () => import('@/modules/admin/pages/AdminImageStoragePage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Invites',
    component: () => import('@/modules/admin/pages/AdminInvitesManagementPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/LoginProviders',
    component: () => import('@/modules/admin/pages/AdminLoginProvidersPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/APISettings',
    component: () => import('@/modules/admin/pages/AdminAPISettingsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/PaymentSettings',
    component: () => import('@/modules/admin/pages/AdminPaymentSettingsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/FinanceDashboard',
    component: () => import('@/modules/admin/pages/AdminFinanceDashboardPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Jobs',
    component: () => import('@/modules/admin/pages/AdminJobsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Projects',
    component: () => import('@/modules/admin/pages/AdminProjectsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Clients',
    component: () => import('@/modules/admin/pages/AdminClientsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Messages',
    component: () => import('@/modules/admin/pages/AdminMessagesPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Products',
    component: () => import('@/modules/admin/pages/AdminProductsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Orders',
    component: () => import('@/modules/admin/pages/AdminOrdersPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/ShopSettings',
    component: () => import('@/modules/admin/pages/AdminShopSettingsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/AuditLogs',
    component: () => import('@/modules/admin/pages/AdminAuditLogsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Subscriptions',
    component: () => import('@/modules/admin/pages/AdminSubscriptionsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  }
];

// Artist routes (artist role required)
const artistRoutes = [
  {
    path: '/artistdashboard',
    component: () => import('@/modules/artist/pages/ArtistDashboardPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/ArtistProfile',
    component: () => import('@/modules/artist/pages/ArtistProfilePage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Jobs',
    component: () => import('@/modules/jobs/pages/JobsPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/JobApplications',
    component: () => import('@/modules/jobs/pages/JobApplicationsPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/JobBoard',
    component: () => import('@/modules/jobs/pages/JobBoardPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/JobInvitations',
    component: () => import('@/modules/jobs/pages/JobInvitationsPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Messages',
    component: () => import('@/modules/messages/pages/MessagesPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Network',
    component: () => import('@/modules/network/pages/NetworkPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Endorsements',
    component: () => import('@/modules/network/pages/EndorsementsPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Testimonials',
    component: () => import('@/modules/network/pages/TestimonialsPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Notifications',
    component: () => import('@/modules/network/pages/NotificationsPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/ActivityFeed',
    component: () => import('@/modules/network/pages/ActivityFeedPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/ArtistSubscriptionCheckout',
    component: () => import('@/modules/artist/pages/ArtistSubscriptionCheckoutPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/Settings',
    component: () => import('@/pages/Settings'),
    layout: DashboardLayout,
    guard: ArtistGuard
  }
];

// Client routes (client role required)
const clientRoutes = [
  {
    path: '/clientdashboard',
    component: () => import('@/modules/client/pages/ClientDashboardPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  }
];

// Team routes (team role required)
const teamRoutes = [
  {
    path: '/teamdashboard',
    component: () => import('@/modules/team/pages/TeamDashboardPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  }
];

// Backer routes (backer role required)
const backerRoutes = [
  {
    path: '/backerdashboard',
    component: () => import('@/modules/backer/pages/BackerDashboardPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerProfile',
    component: () => import('@/modules/backer/pages/BackerProfilePage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerProjects',
    component: () => import('@/modules/backer/pages/BackerProjectsPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerInvestments',
    component: () => import('@/modules/backer/pages/BackerInvestmentsPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerDeals',
    component: () => import('@/modules/backer/pages/BackerDealsPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerAnalytics',
    component: () => import('@/modules/backer/pages/BackerAnalyticsPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerBanking',
    component: () => import('@/modules/backer/pages/BackerBankingPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerPartners',
    component: () => import('@/modules/backer/pages/BackerPartnersPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerInvestmentTiers',
    component: () => import('@/modules/backer/pages/BackerInvestmentTiersPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/BackerProjectUpdates',
    component: () => import('@/modules/backer/pages/BackerProjectUpdatesPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  }
];

// Protected routes (auth required, no specific role)
const protectedRoutes = [];

// Combine all routes
export const routes = [
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...artistRoutes,
  ...clientRoutes,
  ...teamRoutes,
  ...backerRoutes,
  ...protectedRoutes
];

// Export route groups for easier access
export const routeGroups = {
  public: publicRoutes,
  auth: authRoutes,
  admin: adminRoutes,
  artist: artistRoutes,
  client: clientRoutes,
  team: teamRoutes,
  backer: backerRoutes,
  protected: protectedRoutes
};