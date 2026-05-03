import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DriverLayout from './layouts/DriverLayout';

// Public Pages
import ReviewPage from './pages/public/ReviewPage';
import ThankYouPage from './pages/public/ThankYouPage';
import ReviewRedirect from './pages/public/ReviewRedirect';

// Auth Pages
import SignIn         from './layouts/SignIn';
import SignUp         from './layouts/SignUp';
import ForgotPassword from './layouts/ForgotPassword';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import ReviewsPage  from './pages/admin/ReviewsPage';
import ReviewedPage from './pages/admin/ReviewedPage';
import DriversPage  from './pages/admin/DriversPage';
import SettingsPage from './pages/admin/SettingsPage';

// Driver Pages
import DriverOverview from './pages/driver/DriverOverview';
import DriverReviews from './pages/driver/DriverReviews';
import DriverQRCode from './pages/driver/DriverQRCode';
import DriverHelp from './pages/driver/DriverHelp';

function App() {
  return (
    <Routes>
      {/* ─── Root redirect ──────────────────────────────── */}
      <Route path="/" element={<Navigate to="/signin" replace />} />

      {/* ─── Public Routes ───────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/review"            element={<ReviewPage />} />
        <Route path="/review/:serviceId" element={<ReviewPage />} />
        <Route path="/thank-you"         element={<ThankYouPage />} />
        <Route path="/r/:token"          element={<ReviewRedirect />} />
      </Route>

      {/* ─── Auth ───────────────────────────────────────── */}
      <Route path="/signin"      element={<SignIn />} />
      <Route path="/signup"      element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* ─── Admin Dashboard ──────────────────────────── */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index                element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview"      element={<DashboardPage />} />
        <Route path="reviews"       element={<ReviewsPage />} />
        <Route path="drivers"       element={<DriversPage />} />
        <Route path="reviewed"      element={<ReviewedPage />} />
        <Route path="settings"      element={<SettingsPage />} />
      </Route>

      {/* ─── Driver Dashboard ─────────────────────────── */}
      <Route path="/driver" element={<DriverLayout />}>
        <Route index                element={<Navigate to="/driver/overview" replace />} />
        <Route path="overview"      element={<DriverOverview />} />
        <Route path="reviews"       element={<DriverReviews />} />
        <Route path="qrcode"         element={<DriverQRCode />} />
        <Route path="help"           element={<DriverHelp />} />
      </Route>

      {/* ─── Catch-all ──────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

export default App;
