import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Navbar } from './components/Navbar';
import { SitesList } from './components/SitesList';
import { ArtifactsList } from './components/ArtifactsList';
import { SearchPage } from './components/SearchPage';
import { Toaster } from './components/ui/sonner';
import { getSupabaseClient } from './utils/supabase/client';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.getSession();

      if (data?.session) {
        setAccessToken(data.session.access_token);
        setUserId(data.session.user.id);
        setUserName(data.session.user.user_metadata.name || 'Usuário');
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleLogin = (token: string, id: string, name: string) => {
    setAccessToken(token);
    setUserId(id);
    setUserName(name);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseClient();

      await supabase.auth.signOut();
      
      setIsAuthenticated(false);
      setAccessToken('');
      setUserId('');
      setUserName('');
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f1e8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b5a3c] mx-auto mb-4"></div>
          <p className="text-[#6b5d4f]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userName={userName}
      />
      
      <main>
        {currentPage === 'dashboard' && <Dashboard accessToken={accessToken} />}
        {currentPage === 'sites' && <SitesList accessToken={accessToken} userId={userId} />}
        {currentPage === 'artifacts' && <ArtifactsList accessToken={accessToken} userId={userId} />}
        {currentPage === 'search' && <SearchPage />}
      </main>

      <Toaster />
    </div>
  );
}