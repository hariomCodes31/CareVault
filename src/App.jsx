import { useState, Component } from 'react';
import LoginPage from './LoginPage';
import CreateAccount from './CreateAccount';
import NewVisitCaseTaking from './NewVisitCaseTaking';
import AuthenticatedHome from './AuthenticatedHome';
import { getSession, clearSession } from './services/authService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CareVault Error Boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload CareVault
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [sessionData, setSessionData] = useState(() => getSession());
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (!sessionData) return 'login';
    return 'authenticated';
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
    <ErrorBoundary>
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
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {sessionData && (currentScreen === 'authenticated' || currentScreen === 'doctor-portal' || currentScreen === 'patient-dashboard') && (
          <AuthenticatedHome
            session={sessionData}
            onSignOut={handleSignOut}
          />
        )}

        {sessionData && currentScreen === 'case-taking' && (
          <NewVisitCaseTaking
            session={sessionData}
            onSignOut={handleSignOut}
            onReturnToDashboard={() => setCurrentScreen('authenticated')}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
