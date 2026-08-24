/**
 * LETCON - Root Application Component
 * Defines the full routing structure for all user roles.
 */
import { Routes, Route, Navigate } from 'react-router-dom';

// Landing Pages
import LandingPage from './pages/landing/LandingPage';
import RegisterChoice from './pages/landing/RegisterChoice';

// Auth Layout & Pages
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import AdvertiserRegister from './pages/auth/AdvertiserRegister';
import EarnerRegister from './pages/auth/EarnerRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerificationPayment from './pages/auth/VerificationPayment';

// Earner Layout & Pages
import EarnerLayout from './layouts/EarnerLayout';
import EarnerDashboard from './pages/earner/EarnerDashboard';
import AvailableTasks from './pages/earner/AvailableTasks';
import AcceptedTasks from './pages/earner/AcceptedTasks';
import CompletedTasks from './pages/earner/CompletedTasks';
import EarnerWallet from './pages/earner/EarnerWallet';
import Withdraw from './pages/earner/Withdraw';
import Upgrade from './pages/earner/Upgrade';
import AccountChange from './pages/earner/AccountChange';
import VerifiedAccount from './pages/earner/VerifiedAccount';
import EarnerNotifications from './pages/earner/Notifications';
import EarnerTransactions from './pages/earner/Transactions';
import EarnerMessages from './pages/earner/Messages';

// Advertiser Layout & Pages
import AdvertiserLayout from './layouts/AdvertiserLayout';
import AdvertiserDashboard from './pages/advertiser/AdvertiserDashboard';
import AdvertiserWallet from './pages/advertiser/AdvertiserWallet';
import Campaigns from './pages/advertiser/Campaigns';
import CreateCampaign from './pages/advertiser/CreateCampaign';
import TaskReview from './pages/advertiser/TaskReview';
import Analytics from './pages/advertiser/Analytics';
import AdvertiserTransactions from './pages/advertiser/Transactions';
import AdvertiserNotifications from './pages/advertiser/Notifications';
import AdvertiserMessages from './pages/advertiser/Messages';

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import VerificationQueue from './pages/admin/VerificationQueue';
import RejectedTasks from './pages/admin/RejectedTasks';
import Upgrades from './pages/admin/Upgrades';
import AccountChanges from './pages/admin/AccountChanges';
import FlaggedMismatches from './pages/admin/FlaggedMismatches';
import Users from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';

// Super Admin Layout & Pages
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import Revenue from './pages/superadmin/Revenue';
import Admins from './pages/superadmin/Admins';
import Settings from './pages/superadmin/Settings';

/**
 * Root App component with all routes.
 */
export default function App() {
  return (
    <Routes>
      {/* Landing page (public home) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterChoice />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register/advertiser" element={<AdvertiserRegister />} />
        <Route path="/register/earner" element={<EarnerRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification-payment" element={<VerificationPayment />} />
      </Route>

      {/* Earner Routes */}
      <Route path="/earner" element={<EarnerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EarnerDashboard />} />
        <Route path="available-tasks" element={<AvailableTasks />} />
        <Route path="accepted-tasks" element={<AcceptedTasks />} />
        <Route path="completed-tasks" element={<CompletedTasks />} />
        <Route path="wallet" element={<EarnerWallet />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="messages" element={<EarnerMessages />} />
      </Route>

      {/* Advertiser Routes */}
      <Route path="/advertiser" element={<AdvertiserLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdvertiserDashboard />} />
        <Route path="wallet" element={<AdvertiserWallet />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="create-campaign" element={<CreateCampaign />} />
        <Route path="task-review" element={<TaskReview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="transactions" element={<AdvertiserTransactions />} />
        <Route path="notifications" element={<AdvertiserNotifications />} />
        <Route path="messages" element={<AdvertiserMessages />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="verification-queue" element={<VerificationQueue />} />
        <Route path="rejected-tasks" element={<RejectedTasks />} />
        <Route path="upgrades" element={<Upgrades />} />
        <Route path="account-changes" element={<AccountChanges />} />
        <Route path="flagged-mismatches" element={<FlaggedMismatches />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Super Admin Routes */}
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="admins" element={<Admins />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}