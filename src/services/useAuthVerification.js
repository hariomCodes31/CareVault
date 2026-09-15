import { useCallback, useEffect, useRef, useState } from 'react';
import { authRequest, getCaptcha } from './api.js';

export function useAuthVerification() {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [pending, setPending] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retryAt, setRetryAt] = useState(0);
  const requestVersion = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true); setAnswer(''); setChallenge(null); setError('');
    const result = await getCaptcha();
    if (version !== requestVersion.current) return;
    if (result.success) setChallenge(result);
    else setError(result.error);
    setLoading(false);
  }, []);
  useEffect(() => {
    const version = ++requestVersion.current;
    getCaptcha().then(result => {
      if (version !== requestVersion.current) return;
      if (result.success) setChallenge(result);
      else setError(result.error);
      setLoading(false);
    });
    return () => { requestVersion.current += 1; };
  }, [refresh]);
  async function submit(path, payload) {
    if (!pending && (!challenge || answer.trim().length !== 6)) return { success: false, error: 'Enter the six characters shown in the CAPTCHA.' };
    if (pending && !/^\d{6}$/.test(code)) return { success: false, error: 'Enter the six-digit mobile OTP.' };
    const result = await authRequest(path, pending
      ? { ...pending.payload, challengeId: pending.challengeId, code }
      : { ...payload, captchaId: challenge.captchaId, captchaAnswer: answer });
    if (result.otpRequired) {
      setPending({ ...result, payload }); setCode(''); setRetryAt(Date.now() + 60000);
    } else if (!result.success && (!pending || result.restartVerification)) {
      setPending(null); setCode(''); await refresh();
    }
    return result;
  }
  function restart() { setPending(null); setCode(''); void refresh(); }
  return { challenge, answer, setAnswer, pending, code, setCode, error, loading, retryAt, refresh, submit, restart };
}
