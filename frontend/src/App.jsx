import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import CenteringPage from "./pages/CenteringPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import ResultPage from "./pages/ResultPage";
import GuidancePage from "./pages/GuidancePage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminForgotPasswordPage from "./pages/admin/AdminForgotPasswordPage";
import AdminVerifyOtpPage from "./pages/admin/AdminVerifyOtpPage";
import AdminResetPasswordPage from "./pages/admin/AdminResetPasswordPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import QuestionsPage from "./pages/admin/QuestionsPage";
import OptionsPage from "./pages/admin/OptionsPage";
import ChakrasPage from "./pages/admin/ChakrasPage";
import NadisPage from "./pages/admin/NadisPage";
import RemediesPage from "./pages/admin/RemediesPage";
import MantrasPage from "./pages/admin/MantrasPage";
import ContentPage from "./pages/admin/ContentPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import ProfileSelectionPage from "./pages/ProfileSelectionPage";
import TemplatesPage from "./pages/admin/TemplatesPage";

import { QuestionnaireProvider } from "./context/QuestionnaireContext";
import { AdminProvider } from "./context/AdminContext";

function AdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <AdminProvider>
      <QuestionnaireProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/center" element={<CenteringPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/result/:sessionId" element={<ResultPage />} />
          <Route path="/result/:sessionId/guidance" element={<GuidancePage />} />
          <Route path="/profile" element={<ProfileSelectionPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/forgot-password"
            element={<AdminForgotPasswordPage />}
          />
          <Route path="/admin/verify-otp" element={<AdminVerifyOtpPage />} />
          <Route
            path="/admin/reset-password"
            element={<AdminResetPasswordPage />}
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <AdminRoute>
                <QuestionsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/options"
            element={
              <AdminRoute>
                <OptionsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/chakras"
            element={
              <AdminRoute>
                <ChakrasPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/nadis"
            element={
              <AdminRoute>
                <NadisPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/remedies"
            element={
              <AdminRoute>
                <RemediesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/mantras"
            element={
              <AdminRoute>
                <MantrasPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <AdminRoute>
                <ContentPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/templates"
            element={
              <AdminRoute>
                <TemplatesPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </QuestionnaireProvider>
    </AdminProvider>
  );
}