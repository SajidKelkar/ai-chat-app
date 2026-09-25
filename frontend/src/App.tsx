import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatPage } from '@/pages/ChatPage';
import { FullPageLoader } from '@/components/LoadingIndicator';

function AppContent() {
  const { status, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (status === 'loading') {
    return <FullPageLoader label="Loading…" />;
  }

  return <ChatPage />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
