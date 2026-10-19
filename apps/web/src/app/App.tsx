import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from '@/layouts/SiteLayout';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { RequireAdmin, RequireAuth } from '@/components/layout/RouteGuards';
import NotFound, { AccessDenied } from '@/pages/errors';

// Route-level code splitting keeps the first load small.
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Products = lazy(() => import('@/pages/Products'));
const Services = lazy(() => import('@/pages/Services'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const CommunitySubmit = lazy(() => import('@/pages/CommunitySubmit'));
const CommunityGallery = lazy(() => import('@/pages/CommunityGallery'));
const CommunityProjectDetail = lazy(
  () => import('@/pages/CommunityProjectDetail'),
);
const Innovation = lazy(() => import('@/pages/Innovation'));
const Learn = lazy(() => import('@/pages/Learn'));
const Partnerships = lazy(() => import('@/pages/Partnerships'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Support = lazy(() => import('@/pages/Support'));
const Privacy = lazy(() =>
  import('@/pages/Legal').then((m) => ({ default: m.Privacy })),
);
const Terms = lazy(() =>
  import('@/pages/Legal').then((m) => ({ default: m.Terms })),
);
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const Account = lazy(() => import('@/pages/account/Account'));
const Dashboard = lazy(() => import('@/pages/account/Dashboard'));

const CreatorProfilePage = lazy(
  () => import('@/pages/CreatorProfilePage'),
);
const PublicCreatorProfilePage = lazy(
  () => import('@/pages/PublicCreatorProfilePage'),
);

const AdminOverview = lazy(() => import('@/pages/admin/Overview'));
const AdminEnquiries = lazy(() => import('@/pages/admin/Enquiries'));
const AdminPartnerships = lazy(() => import('@/pages/admin/Partnerships'));
const AdminSupport = lazy(() => import('@/pages/admin/Support'));
const AdminRoles = lazy(() => import('@/pages/admin/Roles'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const CommunityModeration = lazy(
  () => import('@/pages/admin/CommunityModeration'),
);

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />
        <Route path="services" element={<Services />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />

        {/* Community project submission */}
        <Route path="community/submit" element={<CommunitySubmit />} />

        {/* Community project gallery */}
        <Route path="community" element={<CommunityGallery />} />

        {/* Individual community project */}
        <Route
          path="community/projects/:id"
          element={<CommunityProjectDetail />}
        />

        {/* Public creator profile */}
        <Route
          path="creators/:uid"
          element={<PublicCreatorProfilePage />}
        />

        <Route path="innovation" element={<Innovation />} />
        <Route path="learn" element={<Learn />} />
        <Route path="partnerships" element={<Partnerships />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="support" element={<Support />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />

        <Route
          path="access-denied"
          element={<AccessDenied reason="forbidden" />}
        />

        <Route
          path="account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />

        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        {/* Creator profile editor — authentication required */}
        <Route
          path="creator-profile"
          element={
            <RequireAuth>
              <CreatorProfilePage />
            </RequireAuth>
          }
        />

        {/* All admin routes remain protected */}
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="partnerships" element={<AdminPartnerships />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="roles" element={<AdminRoles />} />

          {/* Community moderation */}
          <Route path="community" element={<CommunityModeration />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}