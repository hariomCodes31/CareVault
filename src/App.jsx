import { useState, Component } from 'react';
import LoginPage from './LoginPage';
import CreateAccount from './CreateAccount';
import NewVisitCaseTaking from './NewVisitCaseTaking';
import AuthenticatedHome from './AuthenticatedHome';
import LogoIntro from './components/LogoIntro';
import StorytellingLanding from './components/StorytellingLanding';
import CursorBackground from './components/CursorBackground';
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
    return sessionData ? 'authenticated' : 'landing';
  });

  // Controls whether the brand logo introduction animation overlay is active
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionData;
  });

  const handleLoginSuccess = (session) => {
    setSessionData(session);
    setCurrentScreen('authenticated');
  };

  const handleSignOut = () => {
    clearSession();
    setSessionData(null);
    setCurrentScreen('landing');
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Subtle, Minimal Ambient Cursor Glow */}
        {!sessionData && currentScreen === 'landing' && <CursorBackground />}

        {/* Main Content Layer */}
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Brand Logo Entrance Animation Sequence */}
          {showIntro && (
            <LogoIntro onComplete={() => setShowIntro(false)} />
          )}

          {/* Main Landing & Visual Storytelling Scroll Experience */}
          {currentScreen === 'landing' && (
            <StorytellingLanding
              onLoginSuccess={handleLoginSuccess}
              onNavigateToCreateAccount={() => setCurrentScreen('create-account')}
              onReplayIntro={handleReplayIntro}
            />
          )}

          {/* Direct Login Screen */}
          {currentScreen === 'login' && (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateToCreateAccount={() => setCurrentScreen('create-account')}
            />
          )}

          {/* Create Account Screen */}
          {currentScreen === 'create-account' && (
            <CreateAccount
              onReturnToLogin={() => setCurrentScreen(sessionData ? 'authenticated' : 'landing')}
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {/* Authenticated Doctor / Patient Portal */}
          {sessionData && (currentScreen === 'authenticated' || currentScreen === 'doctor-portal' || currentScreen === 'patient-dashboard') && (
            <AuthenticatedHome
              session={sessionData}
              onSignOut={handleSignOut}
              onReturnToCreateAccount={() => setCurrentScreen('create-account')}
            />
          )}

          {/* Case Taking Screen */}
          {sessionData && currentScreen === 'case-taking' && (
            <NewVisitCaseTaking
              session={sessionData}
              onSignOut={handleSignOut}
              onReturnToDashboard={() => setCurrentScreen('authenticated')}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
