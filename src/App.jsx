import { useState } from 'react';
import LogoIntro from './components/LogoIntro';
import StorytellingLanding from './components/StorytellingLanding';
import CreateAccount from './CreateAccount';
import AuthenticatedHome from './AuthenticatedHome';
import CursorBackground from './components/CursorBackground';
import { getSession, clearSession } from './services/authService';

function App() {
  const [sessionData, setSessionData] = useState(() => getSession());
  const [currentScreen, setCurrentScreen] = useState(() => {
    return sessionData ? 'authenticated' : 'landing';
  });

  // Controls whether the brand logo introduction animation overlay is active
  const [showIntro, setShowIntro] = useState(() => {
    // Only show intro animation if not already authenticated
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Subtle, Minimal Ambient Cursor Glow (Strictly behind all content: z-index: 0) */}
      <CursorBackground />

      {/* Main Content Layer (Strictly above background: z-index: 1) */}
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

        {/* Create Account Screen */}
        {currentScreen === 'create-account' && (
          <CreateAccount
            onReturnToLogin={() => setCurrentScreen('landing')}
          />
        )}

        {/* Authenticated Doctor / Patient Portal */}
        {currentScreen === 'authenticated' && (
          <AuthenticatedHome
            session={sessionData}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </div>
  );
}

export default App;
