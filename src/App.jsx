import { useState } from 'react';
import LoginPage from './LoginPage';
import CreateAccount from './CreateAccount';
import NewVisitCaseTaking from './NewVisitCaseTaking';
import AuthenticatedHome from './AuthenticatedHome';
import { getSession, clearSession } from './services/authService';

function App() {
  const [sessionData, setSessionData] = useState(() => getSession());
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (!sessionData) return 'login';
    return sessionData.role === 'doctor' ? 'doctor-portal' : 'case-taking';
  });

  const handleLoginSuccess = (session) => {
    setSessionData(session);
    if (session?.role === 'doctor') {
      setCurrentScreen('doctor-portal');
    } else {
      setCurrentScreen('case-taking');
    }
  };

  const handleSignOut = () => {
    clearSession();
    setSessionData(null);
    setCurrentScreen('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {currentScreen === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToCreateAccount={() => setCurrentScreen('create-account')}
        />
      )}

      {currentScreen === 'create-account' && (
        <CreateAccount
          onReturnToLogin={() => setCurrentScreen('login')}
        />
      )}

      {sessionData && (currentScreen === 'doctor-portal' || sessionData.role === 'doctor') && (
        <AuthenticatedHome
          session={sessionData}
          onSignOut={handleSignOut}
        />
      )}

      {sessionData && (currentScreen === 'case-taking' || sessionData.role === 'patient') && sessionData.role !== 'doctor' && (
        <NewVisitCaseTaking
          session={sessionData}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default App;

