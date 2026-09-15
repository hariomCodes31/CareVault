export function voiceLocale(language) {
  return language === 'en' ? 'en-IN' : `${language}-IN`;
}
export function createOfflineRecognition(Recognition, language, onText) {
  if (!Recognition) throw new Error('This browser does not support voice typing. You can still type your answer.');
  const recognition = new Recognition();
  if (!('processLocally' in recognition)) throw new Error('On-device voice recognition is unavailable in this browser. Please type your answer; audio will not be sent online.');
  recognition.processLocally = true;
  recognition.lang = voiceLocale(language);
  recognition.continuous = true;
  recognition.interimResults = false;
  const received = new Set();
  recognition.onresult = event => {
    for (let index = event.resultIndex; index < event.results.length; index++) {
      const result = event.results[index];
      if (result.isFinal && !received.has(index)) {
        received.add(index);
        const text = result[0]?.transcript?.trim();
        if (text) onText(text);
      }
    }
  };
  return recognition;
}
export function appendDictation(previous, text) {
  return `${previous}${previous && !/\s$/.test(previous) ? ' ' : ''}${text}`.slice(0, 1200);
}
