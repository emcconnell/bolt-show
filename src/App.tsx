import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { TermsPage } from './pages/TermsPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { SubmitProjectPage } from './pages/SubmitProjectPage';
import { AdminSettings } from './pages/AdminSettings';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: 'toast-slide-in 0.3s ease-out forwards',
            },
            duration: 2000,
            success: {
              iconTheme: {
                primary: '#a855f7',
                secondary: '#fff',
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              }
            },
          }} />
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950">
            <Navbar />
            <main className="flex-grow">
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/explore" element={<ErrorBoundary><ExplorePage /></ErrorBoundary>} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/project/:id" element={<ErrorBoundary><ProjectDetailsPage /></ErrorBoundary>} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/submit" element={<ProtectedRoute><ErrorBoundary><SubmitProjectPage /></ErrorBoundary></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ErrorBoundary><ProfilePage /></ErrorBoundary></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><ErrorBoundary><SettingsPage /></ErrorBoundary></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><ErrorBoundary><AdminSettings /></ErrorBoundary></ProtectedRoute>} />
                  <Route path="/admin/projects" element={<ProtectedRoute requireAdmin><ErrorBoundary><AdminProjectsPage /></ErrorBoundary></ProtectedRoute>} />
                </Routes>
              </Layout>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}