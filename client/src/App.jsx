import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useStore from './store';
import { useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppLayout from './pages/AppLayout';
import Landing from './pages/Landing';

function ProtectedRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const isAuthenticated = useStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return children;
}

function AuthModal() {
  const { authModalOpen, authModalType, closeAuthModal, openAuthModal } = useStore();
  if (!authModalOpen) return null;
  if (authModalType === 'login') {
    return <Login onClose={closeAuthModal} onSwitch={() => openAuthModal('signup')} />;
  }
  return <Signup onClose={closeAuthModal} onSwitch={() => openAuthModal('login')} />;
}

export default function App() {
  const { token, fetchMe } = useStore();

  useEffect(() => {
    if (token) fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#24292D',
            color: '#E9ECEB',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#9DFF3F', secondary: '#24292D' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/app/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModal />
    </BrowserRouter>
  );
}
