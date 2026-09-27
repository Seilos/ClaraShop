import React, { useState, useEffect } from 'react';
import { AuthPage } from './pages/AuthPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { useAuth } from './hooks/useAuth.js';

export function App() {
  const [authState, setAuthState] = useState({ user: null, accessToken: null });
  const { tryRefresh, logout: authLogout } = useAuth();

  useEffect(() => {
    // Silent session restore on app load via HttpOnly cookie
    tryRefresh().catch(() => {});
  }, [tryRefresh]);

  const handleAuthSuccess = (data) => {
    setAuthState({
      user: data.user,
      accessToken: data.accessToken,
    });
  };

  const handleLogout = async () => {
    await authLogout();
    setAuthState({ user: null, accessToken: null });
  };

  if (!authState.user || !authState.accessToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <DashboardPage
      user={authState.user}
      accessToken={authState.accessToken}
      onLogout={handleLogout}
    />
  );
}

export default App;
