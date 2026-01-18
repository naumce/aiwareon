import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { InstallPrompt } from './components/InstallPrompt';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { StudioPage } from './pages/StudioPage';
import { GalleryPage } from './pages/GalleryPage';
import { AccountPage } from './pages/AccountPage';
import { WardrobePage } from './pages/WardrobePage';
import { OutfitsPage } from './pages/OutfitsPage';
import { TonightsLookPage } from './pages/TonightsLookPage';
import { StudioLayout } from './components/StudioLayout';

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8  border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          {/* Public routes per 09_ROUTING_PATTERN.md */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Pricing</h1>
                <p className="text-zinc-400 mt-2">Coming soon...</p>
              </div>
            </div>
          } />


          {/* Protected routes - require auth */}
          <Route element={
            <ProtectedRoute>
              <StudioLayout />
            </ProtectedRoute>
          }>
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/studio/tonight" element={<TonightsLookPage />} />
            <Route path="/studio/wardrobe" element={<WardrobePage />} />
            <Route path="/studio/outfits" element={<OutfitsPage />} />
            <Route path="/studio/account" element={<AccountPage />} />
            <Route path="/studio/history" element={<GalleryPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
