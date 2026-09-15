import { useEffect, useRef, useState } from 'react';
import { createOfflineRecognition, voiceLocale } from '../services/offlineDictation.js';

function abortSession(ref) {
  const recognition = ref.current;
  if (!recognition) return;
  recognition.onresult = null; recognition.onstart = null;
  recognition.onend = null; recognition.onerror = null;
  recognition.abort(); ref.current = null;
}

function disposeVoice(version, session) {
  version.current++;
  abortSession(session);
}

export default function VoiceDictation({ language, active, onText }) {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const session = useRef(null);
  const version = useRef(0);
  const callback = useRef(onText);
  useEffect(() => { callback.current = onText; }, [onText]);
  const stop = () => {
    version.current++;
    if (session.current) {
      session.current.onresult = null;
      session.current.onend = null;
      session.current.onerror = null;
      session.current.abort();
      session.current = null;
    }
    setStatus('idle');
  };
  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      disposeVoice(version, session);
    };
  }, []);
  async function start() {
    if (!active || status !== 'idle') return;
    const current = ++version.current;
    const valid = () => current === version.current;
    setMessage(''); setStatus('preparing');
    try {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = createOfflineRecognition(Recognition, language, text => { if (valid()) callback.current(text); });
      if (typeof Recognition.available === 'function') {
        const options = { langs: [voiceLocale(language)], processLocally: true };
        const availability = await Recognition.available(options);
        if (!valid()) return;
        if (availability === 'downloadable') {
          setMessage('Downloading the on-device language pack. Your voice is not being recorded.');
          if (typeof Recognition.install !== 'function' || !await Recognition.install(options)) throw new Error('Language pack could not be installed. Please type your answer.');
        } else if (availability !== 'available') {
          throw new Error(availability === 'downloading' ? 'Language pack is downloading. Try again when it finishes.' : 'On-device voice is unavailable for this language. Select a supported language or type your answer.');
        }
      }
      if (!valid()) return;
      recognition.onstart = () => { if (valid()) { setStatus('listening'); setMessage('Listening… बोलिए। Review the text before sending.'); } };
      recognition.onend = () => { if (valid()) { session.current = null; setStatus('idle'); setMessage(previous => previous.startsWith('Listening') ? 'Voice typing finished. Review your answer, then Send.' : previous); } };
      recognition.onerror = event => {
        if (!valid()) return;
        const errors = {
          'not-allowed': 'Microphone permission denied. Allow microphone access in your browser settings, then retry.',
          'audio-capture': 'No microphone is available. Connect one or type your answer.',
          'no-speech': 'No speech detected. Press the microphone and try again.',
          'language-not-supported': 'On-device voice is not supported for this language. Please type your answer.',
          'network': 'On-device recognition failed. Please type your answer; no online fallback is used.',
        };
        setMessage(errors[event.error] || 'Voice typing stopped. You can retry or type your answer.');
        abortSession(session);
        setStatus('idle');
      };
      session.current = recognition;
      recognition.start();
    } catch (error) {
      if (!valid()) return;
      session.current = null; setStatus('idle'); setMessage(error.message || 'Voice typing is unavailable. Please type your answer.');
    }
  }
  return <div className="sc-voice">
    <button type="button" aria-pressed={status === 'listening'} onClick={status === 'idle' ? start : stop}>
      {status === 'listening' ? '■ Stop mic / माइक बंद करें' : status === 'preparing' ? 'Cancel voice setup' : '🎙 Speak / बोलकर लिखें'}
    </button>
    <small>On-device voice only. First use may download a language pack. Voice support varies by browser and language.</small>
    {message && <p role="status">{message}</p>}
  </div>;
}
