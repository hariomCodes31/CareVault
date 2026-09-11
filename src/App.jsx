import { useState } from 'react';
import LoginPage from './LoginPage';
import CreateAccount from './CreateAccount';
import AuthenticatedHome from './AuthenticatedHome';
import { getSession, clearSession } from './services/authService';

function App() {
  const [sessionData, setSessionData] = useState(() => getSession());
  const [currentScreen, setCurrentScreen] = useState(() => {
    return sessionData ? 'authenticated' : 'login';
  });

  const handleLoginSuccess = (session) => {
    setSessionData(session);
    setCurrentScreen('authenticated');
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

      {currentScreen === 'authenticated' && (
        <AuthenticatedHome
          session={sessionData}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default App;
