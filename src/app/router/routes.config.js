import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import DashboardLayout from '@/layouts/DashboardLayout'
import AuthLayout from '@/layouts/AuthLayout'
import { AuthGuard } from '@/app/router/guards/AuthGuard'
import { RoleGuard, createRoleGuard } from '@/app/router/guards/RoleGuard'
import { GuestGuard } from '@/app/router/guards/GuestGuard'
import { HomeGuard } from '@/app/router/guards/HomeGuard'
import { MaintenanceGuard } from '@/app/router/guards/MaintenanceGuard'
// Temporarily disable permission guards until migration is complete
// import { createRoutePermissionGuard } from '@/app/router/guards/PermissionGuard'

// Create permission-based guards for admin routes (DISABLED TEMPORARILY)
// const AdminDashboardGuard = createRoutePermissionGuard('/Admin')
// const ArtistsGuard = createRoutePermissionGuard('/Admin/Artists')
// const TeamsGuard = createRoutePermissionGuard('/Admin/Teams')
// const ProjectsGuard = createRoutePermissionGuard('/Admin/Projects')
// const UserManagementGuard = createRoutePermissionGuard('/Admin/UserManagement')
// const RolesPermissionsGuard = createRoutePermissionGuard('/Admin/RolesPermissions')
// const SettingsGuard = createRoutePermissionGuard('/Admin/Settings')
// const SEOCMSGuard = createRoutePermissionGuard('/Admin/SEOCMS')
// const ImageStorageGuard = createRoutePermissionGuard('/Admin/ImageStorage')
// const InvitesGuard = createRoutePermissionGuard('/Admin/Invites')
// const LoginProvidersGuard = createRoutePermissionGuard('/Admin/LoginProviders')
// const APISettingsGuard = createRoutePermissionGuard('/Admin/APISettings')
// const PaymentSettingsGuard = createRoutePermissionGuard('/Admin/PaymentSettings')
// const AnalyticsGuard = createRoutePermissionGuard('/Admin/Analytics')
// const FinanceDashboardGuard = createRoutePermissionGuard('/Admin/FinanceDashboard')
// const JobsGuard = createRoutePermissionGuard('/Admin/Jobs')
// const ClientsGuard = createRoutePermissionGuard('/Admin/Clients')
// const MessagesGuard = createRoutePermissionGuard('/Admin/Messages')
// const ProductsGuard = createRoutePermissionGuard('/Admin/Products')
// const OrdersGuard = createRoutePermissionGuard('/Admin/Orders')
// const ShopSettingsGuard = createRoutePermissionGuard('/Admin/ShopSettings')
// const AuditLogsGuard = createRoutePermissionGuard('/Admin/AuditLogs')
// const SubscriptionsGuard = createRoutePermissionGuard('/Admin/Subscriptions')
// const TickerGuard = createRoutePermissionGuard('/Admin/Ticker')
// const CategoriesGuard = createRoutePermissionGuard('/Admin/Categories')
// const BackersGuard = createRoutePermissionGuard('/Admin/Backers')
// const FeaturedWorkGuard = createRoutePermissionGuard('/Admin/FeaturedWork')
// const SuccessStoriesGuard = createRoutePermissionGuard('/Admin/SuccessStories')
// const RecentProjectsGuard = createRoutePermissionGuard('/Admin/RecentProjects')

// Use role-based guards temporarily (only using existing roles from database)
const AdminDashboardGuard = createRoleGuard(['admin'])
const ArtistsGuard = createRoleGuard(['admin'])
const TeamsGuard = createRoleGuard(['admin'])
const ProjectsGuard = createRoleGuard(['admin'])
const UserManagementGuard = createRoleGuard(['admin'])
const RolesPermissionsGuard = createRoleGuard(['admin'])
const SettingsGuard = createRoleGuard(['admin'])
const SEOCMSGuard = createRoleGuard(['admin'])
const ImageStorageGuard = createRoleGuard(['admin'])
const InvitesGuard = createRoleGuard(['admin'])
const LoginProvidersGuard = createRoleGuard(['admin'])
const APISettingsGuard = createRoleGuard(['admin'])
const PaymentSettingsGuard = createRoleGuard(['admin'])
const AnalyticsGuard = createRoleGuard(['admin'])
const FinanceDashboardGuard = createRoleGuard(['admin'])
const JobsGuard = createRoleGuard(['admin'])
const ClientsGuard = createRoleGuard(['admin'])
const MessagesGuard = createRoleGuard(['admin'])
const ProductsGuard = createRoleGuard(['admin'])
const OrdersGuard = createRoleGuard(['admin'])
const ShopSettingsGuard = createRoleGuard(['admin'])
const AuditLogsGuard = createRoleGuard(['admin'])
const SubscriptionsGuard = createRoleGuard(['admin'])
const TickerGuard = createRoleGuard(['admin'])
const CategoriesGuard = createRoleGuard(['admin'])
const BackersGuard = createRoleGuard(['admin'])
const FeaturedWorkGuard = createRoleGuard(['admin'])
const SuccessStoriesGuard = createRoleGuard(['admin'])
const RecentProjectsGuard = createRoleGuard(['admin'])

// Keep role-based guards for non-admin routes (using existing roles from database)
const AdminGuard = createRoleGuard(['admin'])
const ArtistAdminGuard = createRoleGuard(['admin', 'artist'])
const TeamAdminGuard = createRoleGuard(['admin', 'team'])
const ProjectAdminGuard = createRoleGuard(['admin', 'client', 'project_owner'])
const ArtistGuard = createRoleGuard(['artist'])
const ClientGuard = createRoleGuard(['client', 'project_owner'])
const TeamGuard = createRoleGuard(['team'])
const BackerGuard = createRoleGuard(['backer'])

// Public pages (no auth required)
const publicRoutes = [
  {
    path: '/Maintenance',
    component: () => import('@/modules/maintenance/MaintenancePage'),
    layout: null
  },
  {
    path: '/code/:code',
    component: () => import('@/modules/maintenance/AccessCodePage'),
    layout: null
  },
  {
    path: '/',
    component: () => import('@/pages/Home'),
    layout: null,
    guard: HomeGuard,
    exact: true
  },
  {
    path: '/FindJobs',
    component: () => import('@/pages/FindJobsPage'),
    layout: null,
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
    path: '/AIsubmission',
    component: () => import('@/pages/AISubmission'),
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
    path: '/legal/privacy',
    component: () => import('@/pages/PrivacyPolicy'),
    layout: null
  },
  {
    path: '/legal/terms',
    component: () => import('@/pages/TermsConditions'),
    layout: null
  },
  {
    path: '/legal/gdpr',
    component: () => import('@/pages/GDPR'),
    layout: null
  },
  {
    path: '/legal/cookies',
    component: () => import('@/pages/CookiePolicy'),
    layout: null
  },
  {
    path: '/legal/imprint',
    component: () => import('@/pages/Imprint'),
    layout: null
  },
  {
    path: '/Work',
    component: () => import('@/pages/Work'),
    layout: MainLayout
  },
  {
    path: '/ProjectPublic',
    component: () => import('@/pages/ProjectPublic'),
    layout: MainLayout
  },
  {
    path: '/ClientPublicProfile/:id',
    component: () => import('@/pages/ClientPublicProfile'),
    layout: MainLayout
  },
  {
    path: '/ArtistPublicProfile',
    component: () => import('@/pages/ArtistPublicProfile'),
    layout: MainLayout
  },
  {
    path: '/artist/:id',
    component: () => import('@/pages/ArtistPublicProfile'),
    layout: MainLayout
  },
  {
    path: '/Categories',
    component: () => import('@/pages/CategoriesPage'),
    layout: MainLayout
  },
  {
    path: '/Category/:slug',
    component: () => import('@/pages/CategorySinglePage'),
    layout: MainLayout
  },
  {
    path: '/invite/:code',
    component: () => import('@/pages/InviteLanding'),
    layout: MainLayout
  },
  {
    path: '/article/:slug',
    component: () => import('@/pages/ArticleDetailPage'),
    layout: MainLayout
  },
  {
    path: '/About',
    component: () => import('@/pages/About'),
    layout: null
  },
  {
    path: '/Shop',
    component: () => import('@/pages/Shop'),
    layout: null
  },
  {
    path: '/ShopProduct/:id',
    component: () => import('@/pages/ShopProduct'),
    layout: null
  },
  {
    path: '/shop/:id',
    component: () => import('@/pages/ShopProduct'),
    layout: null
  },
  {
    path: '/Cart',
    component: () => import('@/pages/Cart'),
    layout: null
  },
  {
    path: '/Checkout',
    component: () => import('@/pages/Checkout'),
    layout: null
  },
  {
    path: '/Wishlist',
    component: () => import('@/pages/Wishlist'),
    layout: null
  },
  {
    path: '/Careers',
    component: () => import('@/pages/Careers'),
    layout: null
  },
  {
    path: '/Help',
    component: () => import('@/pages/HelpCenter'),
    layout: null
  },
  {
    path: '/Contact',
    component: () => import('@/pages/ContactUs'),
    layout: null
  },
  {
    path: '/Pricing',
    component: () => import('@/pages/PricingPage'),
    layout: null
  },
  {
    path: '/HiringTalent',
    component: () => import('@/pages/HiringTalent'),
    layout: null
  },
  {
    path: '/talent',
    component: () => import('@/pages/TalentPage'),
    layout: null
  },
  {
    path: '/FAQ',
    component: () => import('@/pages/FAQ'),
    layout: null
  }
]

// Auth pages (guest only - redirect if logged in)
const authRoutes = [
  {
    path: '/SignIn',
    component: () => import('@/pages/SignIn'),
    layout: AuthLayout,
    guard: GuestGuard
  },
  {
    path: '/SignUp',
    component: () => import('@/pages/SignUp'),
    layout: AuthLayout,
    guard: GuestGuard
  },
  {
    path: '/AcceptTeamInvite',
    component: () => import('@/pages/AcceptTeamInvite'),
    layout: AuthLayout,
    guard: GuestGuard
  }
]

// Admin routes (permission-based access control)
const adminRoutes = [
  {
    path: '/Admin',
    component: () => import('@/modules/admin/pages/AdminDashboardPage'),
    layout: AdminLayout,
    guard: AdminDashboardGuard
  },
  {
    path: '/ArtistAdmin',
    component: () => import('@/modules/admin/pages/ArtistAdminPage'),
    layout: AdminLayout,
    guard: ArtistsGuard
  },
  {
    path: '/TeamAdmin',
    component: () => import('@/modules/admin/pages/TeamAdminPage'),
    layout: AdminLayout,
    guard: TeamsGuard
  },
  {
    path: '/ProjectAdmin',
    component: () => import('@/modules/admin/pages/ProjectAdminPage'),
    layout: AdminLayout,
    guard: ProjectsGuard
  },
  {
    path: '/Admin/UserManagement',
    component: () => import('@/modules/admin/pages/AdminUsersPage'),
    layout: AdminLayout,
    guard: UserManagementGuard
  },
  {
    path: '/Admin/RolesPermissions',
    component: () => import('@/modules/admin/pages/AdminRolesPermissionsPage'),
    layout: AdminLayout,
    guard: RolesPermissionsGuard
  },
  {
    path: '/Admin/GeneralSettings',
    component: () => import('@/modules/admin/pages/AdminGeneralSettingsPage'),
    layout: AdminLayout,
    guard: SettingsGuard
  },
  {
    path: '/Admin/Maintenance',
    component: () => import('@/modules/admin/pages/AdminMaintenancePage'),
    layout: AdminLayout,
    guard: SettingsGuard
  },
  {
    path: '/Admin/Settings',
    component: () => import('@/modules/admin/pages/AdminSettingsPage'),
    layout: AdminLayout,
    guard: SettingsGuard
  },
  {
    path: '/Admin/SEOCMS',
    component: () => import('@/modules/admin/pages/AdminSEOCMSPage'),
    layout: AdminLayout,
    guard: SEOCMSGuard
  },
  {
    path: '/Admin/ImageStorage',
    component: () => import('@/modules/admin/pages/AdminImageStoragePage'),
    layout: AdminLayout,
    guard: ImageStorageGuard
  },
  {
    path: '/Admin/Invites',
    component: () => import('@/modules/admin/pages/AdminInvitesManagementPage'),
    layout: AdminLayout,
    guard: InvitesGuard
  },
  {
    path: '/Admin/LoginProviders',
    component: () => import('@/modules/admin/pages/AdminLoginProvidersPage'),
    layout: AdminLayout,
    guard: LoginProvidersGuard
  },
  {
    path: '/Admin/APISettings',
    component: () => import('@/modules/admin/pages/AdminAPISettingsPage'),
    layout: AdminLayout,
    guard: APISettingsGuard
  },
  {
    path: '/Admin/PaymentSettings',
    component: () => import('@/modules/admin/pages/AdminPaymentSettingsPage'),
    layout: AdminLayout,
    guard: PaymentSettingsGuard
  },
  {
    path: '/Admin/Analytics',
    component: () => import('@/modules/admin/pages/AdminAnalyticsPage'),
    layout: AdminLayout,
    guard: AnalyticsGuard
  },
  {
    path: '/Admin/FinanceDashboard',
    component: () => import('@/modules/admin/pages/AdminFinanceDashboardPage'),
    layout: AdminLayout,
    guard: FinanceDashboardGuard
  },
  {
    path: '/Admin/Jobs',
    component: () => import('@/modules/admin/pages/AdminJobsPage'),
    layout: AdminLayout,
    guard: JobsGuard
  },
  {
    path: '/Admin/Projects',
    component: () => import('@/modules/admin/pages/AdminProjectsPage'),
    layout: AdminLayout,
    guard: ProjectsGuard
  },
  {
    path: '/Admin/Clients',
    component: () => import('@/modules/admin/pages/AdminClientsPage'),
    layout: AdminLayout,
    guard: ClientsGuard
  },
  {
    path: '/Admin/Messages',
    component: () => import('@/modules/admin/pages/AdminMessagesPage'),
    layout: AdminLayout,
    guard: MessagesGuard
  },
  {
    path: '/Admin/Products',
    component: () => import('@/modules/admin/pages/AdminProductsPage'),
    layout: AdminLayout,
    guard: ProductsGuard
  },
  {
    path: '/Admin/Orders',
    component: () => import('@/modules/admin/pages/AdminOrdersPage'),
    layout: AdminLayout,
    guard: OrdersGuard
  },
  {
    path: '/Admin/ShopSettings',
    component: () => import('@/modules/admin/pages/AdminShopSettingsPage'),
    layout: AdminLayout,
    guard: ShopSettingsGuard
  },
  {
    path: '/Admin/CardPayments',
    component: () => import('@/modules/admin/pages/AdminCardPaymentsPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/Partners',
    component: () => import('@/modules/admin/pages/AdminPartnersPage'),
    layout: AdminLayout,
    guard: AdminGuard
  },
  {
    path: '/Admin/AuditLogs',
    component: () => import('@/modules/admin/pages/AdminAuditLogsPage'),
    layout: AdminLayout,
    guard: AuditLogsGuard
  },
  {
    path: '/Admin/Subscriptions',
    component: () => import('@/modules/admin/pages/AdminSubscriptionsPage'),
    layout: AdminLayout,
    guard: SubscriptionsGuard
  },
  {
    path: '/Admin/Ticker',
    component: () => import('@/modules/admin/pages/AdminTickerPage'),
    layout: AdminLayout,
    guard: TickerGuard
  },
  {
    path: '/Admin/Categories',
    component: () => import('@/modules/admin/pages/AdminCategoriesPage'),
    layout: AdminLayout,
    guard: CategoriesGuard
  },
  {
    path: '/Admin/Artists',
    component: () => import('@/modules/admin/pages/AdminArtistsPage'),
    layout: AdminLayout,
    guard: ArtistsGuard
  },
  {
    path: '/Admin/Backers',
    component: () => import('@/modules/admin/pages/AdminBackersPage'),
    layout: AdminLayout,
    guard: BackersGuard
  },
  {
    path: '/Admin/Teams',
    component: () => import('@/modules/admin/pages/AdminTeamsPage'),
    layout: AdminLayout,
    guard: TeamsGuard
  },
  {
    path: '/Admin/FeaturedWork',
    component: () => import('@/modules/admin/pages/AdminFeaturedWorkPage'),
    layout: AdminLayout,
    guard: FeaturedWorkGuard
  },
  {
    path: '/Admin/SuccessStories',
    component: () => import('@/modules/admin/pages/AdminSuccessStoriesPage'),
    layout: AdminLayout,
    guard: SuccessStoriesGuard
  },
  {
    path: '/Admin/RecentProjects',
    component: () => import('@/modules/admin/pages/AdminRecentProjectsPage'),
    layout: AdminLayout,
    guard: RecentProjectsGuard
  },
  {
    path: '/Admin/Popups',
    component: () => import('@/modules/admin/pages/AdminPopupsPage'),
    layout: AdminLayout,
    guard: AdminDashboardGuard
  },
  {
    path: '/Admin/FeaturedCreatives',
    component: () => import('@/modules/admin/pages/AdminFeaturedCreativesPage'),
    layout: AdminLayout,
    guard: AdminDashboardGuard
  },
  {
    path: '/Admin/FeaturedBrands',
    component: () => import('@/modules/admin/pages/AdminFeaturedBrandsPage'),
    layout: AdminLayout,
    guard: AdminDashboardGuard
  },
  {
    path: '/Admin/ShopAuctions',
    component: () => import('@/modules/admin/pages/AdminShopAuctionsPage'),
    layout: AdminLayout,
    guard: AdminDashboardGuard
  }
]

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
    path: '/ArtistFinance',
    component: () => import('@/modules/artist/pages/ArtistFinancePage'),
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
    path: '/Network',
    component: () => import('@/modules/network/pages/NetworkPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  },
  {
    path: '/ArtistSubscriptionCheckout',
    component: () => import('@/modules/artist/pages/ArtistSubscriptionCheckoutPage'),
    layout: DashboardLayout,
    guard: ArtistGuard
  }
]

// Client routes (client role required)
const clientRoutes = [
  {
    path: '/clientdashboard',
    component: () => import('@/modules/client/pages/ClientDashboardPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientPostProject',
    component: () => import('@/modules/client/pages/ClientPostProjectPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientApplications',
    component: () => import('@/modules/client/pages/ClientApplicationsPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientMessages',
    component: () => import('@/modules/client/pages/ClientMessagesPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientNotifications',
    component: () => import('@/modules/network/pages/NotificationsPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientAnalytics',
    component: () => import('@/modules/client/pages/ClientAnalyticsPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/SupportTickets',
    component: () => import('@/modules/support/pages/SupportTicketsPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientProfile',
    component: () => import('@/modules/client/pages/ClientProfilePage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/BrowseTalent',
    component: () => import('@/modules/client/pages/BrowseTalentPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/SavedTalent',
    component: () => import('@/modules/network/pages/SavedTalentPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  },
  {
    path: '/ClientProjects',
    component: () => import('@/modules/client/pages/ClientProjectsPage'),
    layout: DashboardLayout,
    guard: ClientGuard
  }
]

// Team routes (team role required)
const teamRoutes = [
  {
    path: '/teamdashboard',
    component: () => import('@/modules/team/pages/TeamDashboardPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamMembers',
    component: () => import('@/modules/team/pages/TeamMembersPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamProjects',
    component: () => import('@/modules/team/pages/TeamProjectsPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamMessages',
    component: () => import('@/modules/team/pages/TeamMessagesPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/SupportTickets',
    component: () => import('@/modules/support/pages/SupportTicketsPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamPayments',
    component: () => import('@/modules/team/pages/TeamPaymentsPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamProfile',
    component: () => import('@/modules/team/pages/TeamProfilePage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamApplications',
    component: () => import('@/modules/jobs/pages/JobApplicationsPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  },
  {
    path: '/TeamFinance',
    component: () => import('@/modules/team/pages/TeamPaymentsPage'),
    layout: DashboardLayout,
    guard: TeamGuard
  }
]

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
  },
  {
    path: '/Messages',
    component: () => import('@/modules/messages/pages/MessagesPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/SupportTickets',
    component: () => import('@/modules/support/pages/SupportTicketsPage'),
    layout: DashboardLayout,
    guard: BackerGuard
  },
  {
    path: '/accept-invite',
    component: () => import('@/pages/AcceptInvitePage'),
    layout: null,
    guard: null
  }
]

// Protected routes (auth required, no specific role) — shared across artist/team/client/backer
const protectedRoutes = [
  {
    path: '/Network',
    component: () => import('@/modules/network/pages/NetworkPage'),
    layout: DashboardLayout,
    guard: AuthGuard
  },
  {
    path: '/SupportTickets',
    component: () => import('@/modules/support/pages/SupportTicketsPage'),
    layout: DashboardLayout,
    guard: AuthGuard
  }
]

// Combine all routes
export const routes = [
  ...publicRoutes,
  ...authRoutes,
  ...adminRoutes,
  ...artistRoutes,
  ...clientRoutes,
  ...teamRoutes,
  ...backerRoutes,
  ...protectedRoutes,
  {
    path: '*',
    component: () => import('@/pages/NotFoundPage'),
    layout: null
  }
]

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
}