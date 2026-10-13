import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import WelcomePage from './pages/auth/WelcomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import SelectRolePage from './pages/auth/SelectRolePage';
import ProfileSetupPage from './pages/auth/ProfileSetupPage';
import ExplorePage from './pages/ExplorePage';

import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerStartPage from './pages/customer/CustomerStartPage';
import RequirementFlowPage from './pages/customer/RequirementFlowPage';
import FindCreatorsPage from './pages/customer/FindCreatorsPage';
import CreatorProfilePage from './pages/customer/CreatorProfilePage';
import BookCreatorPage from './pages/customer/BookCreatorPage';
import PaymentPage from './pages/customer/PaymentPage';
import FinalPaymentPage from './pages/customer/FinalPaymentPage';
import CustomerProjectsPage from './pages/customer/CustomerProjectsPage';
import ProjectDetailPage from './pages/customer/ProjectDetailPage';
import CustomerPreviewPage from './pages/customer/CustomerPreviewPage';
import CustomerDeliveryPage from './pages/customer/CustomerDeliveryPage';
import PaymentsPage from './pages/customer/PaymentsPage';

import CreatorDashboardPage from './pages/creator/CreatorDashboardPage';
import CreatorOnboardingPage from './pages/creator/CreatorOnboardingPage';
import CreatorRequestsPage from './pages/creator/CreatorRequestsPage';
import CreatorRequestDetailPage from './pages/creator/CreatorRequestDetailPage';
import CreatorProjectsPage from './pages/creator/CreatorProjectsPage';
import CreatorPortfolioPage from './pages/creator/CreatorPortfolioPage';
import CreatorServicesPage from './pages/creator/CreatorServicesPage';
import CreatorEarningsPage from './pages/creator/CreatorEarningsPage';
import CreatorPendingPage from './pages/creator/CreatorPendingPage';
import CreatorAvailabilityPage from './pages/creator/CreatorAvailabilityPage';

import WorkspacePage from './pages/shared/WorkspacePage';
import MessagesPage from './pages/shared/MessagesPage';
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage from './pages/shared/ProfilePage';

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <LandingPage />;
  if (user?.role === 'creator') {
    if (user.creatorStatus === 'approved') return <Navigate to="/creator/dashboard" replace />;
    if (user.creatorStatus === 'pending_verification' || user.creatorStatus === 'under_review') {
      return <Navigate to="/creator/pending" replace />;
    }
    return <Navigate to="/creator/onboarding" replace />;
  }
  return <Navigate to="/customer/home" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/select-role" element={<ProtectedRoute><SelectRolePage /></ProtectedRoute>} />
      <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
      <Route path="/explore" element={<ExplorePage />} />

      {/* Customer Routes */}
      <Route path="/customer" element={<ProtectedRoute role="seeker"><DashboardLayout role="seeker" /></ProtectedRoute>}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<CustomerHomePage />} />
        <Route path="start" element={<CustomerStartPage />} />
        <Route path="requirement" element={<RequirementFlowPage />} />
        <Route path="requirement/:categoryId" element={<RequirementFlowPage />} />
        <Route path="find-creators" element={<FindCreatorsPage />} />
        <Route path="creator/:id" element={<CreatorProfilePage />} />
        <Route path="book-creator/:id" element={<BookCreatorPage />} />
        <Route path="select-creator/:id" element={<BookCreatorPage />} />
        <Route path="payment/:id" element={<PaymentPage />} />
        <Route path="projects" element={<CustomerProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/preview" element={<CustomerPreviewPage />} />
        <Route path="projects/:id/delivery" element={<CustomerDeliveryPage />} />
        <Route path="projects/:id/workspace" element={<WorkspacePage />} />
        <Route path="projects/:id/payment" element={<FinalPaymentPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Creator Routes */}
      <Route path="/creator" element={<ProtectedRoute role="creator"><DashboardLayout role="creator" /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CreatorDashboardPage />} />
        <Route path="onboarding" element={<CreatorOnboardingPage />} />
        <Route path="availability" element={<CreatorAvailabilityPage />} />
        <Route path="pending" element={<CreatorPendingPage />} />
        <Route path="requests" element={<CreatorRequestsPage />} />
        <Route path="requests/:id" element={<CreatorRequestDetailPage />} />
        <Route path="projects" element={<CreatorProjectsPage />} />
        <Route path="projects/:id/workspace" element={<WorkspacePage />} />
        <Route path="portfolio" element={<CreatorPortfolioPage />} />
        <Route path="services" element={<CreatorServicesPage />} />
        <Route path="earnings" element={<CreatorEarningsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
