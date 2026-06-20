import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import Layout from "./components/Layout";
import CoveredCallsPage from "./pages/CoveredCallsPage";
import PutOptionsPage from "./pages/PutOptionsPage";
import SpreadOptionsPage from "./pages/SpreadOptionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AccountPage from "./pages/AccountPage";
import WatchlistPage from "./pages/WatchlistPage";
import DashboardPage from "./pages/DashboardPage";
import GlossaryPage from "./pages/GlossaryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/glossary" element={<GlossaryPage />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Layout>
              <DashboardPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/covered-calls"
        element={
          <RequireAuth>
            <Layout>
              <CoveredCallsPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/put-options"
        element={
          <RequireAuth>
            <Layout>
              <PutOptionsPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/spread-options"
        element={
          <RequireAuth>
            <Layout>
              <SpreadOptionsPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/watchlist"
        element={
          <RequireAuth>
            <Layout>
              <WatchlistPage />
            </Layout>
          </RequireAuth>
        }
      />

      <Route
        path="/account"
        element={
          <RequireAuth>
            <Layout>
              <AccountPage />
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
