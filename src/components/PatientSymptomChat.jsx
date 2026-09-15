import VoiceDictation from './VoiceDictation';
import { appendDictation } from '../services/offlineDictation.js';
import { useEffect, useRef, useState } from 'react';
import languages from '../services/chatLanguages.json';
import { STEPS, QUESTIONS, OPTIONS, EMERGENCY_SIGNS, EMERGENCY_HINDI, SOURCES, getChatOutcome } from '../services/symptomChat.js';
import './PatientSymptomChat.css';

export default function PatientSymptomChat({ active = true }) {
  const [languageCode, setLanguageCode] = useState('hi');
  const [answers, setAnswers] = useState({});
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [inputError, setInputError] = useState('');
  const [notes, setNotes] = useState([]);
  const transcriptRef = useRef(null);
  const language = languages.find(item => item.code === languageCode) || languages[0];
  const outcome = getChatOutcome(answers);
  const step = STEPS.find(key => !answers[key]);
  const stopped = outcome.kind !== 'incomplete';
  const rtl = ['ur', 'ks', 'sd'].includes(languageCode);
  useEffect(() => {
    if (!active || !transcriptRef.current) return;
    transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [answers, notes, active]);
  const submit = value => {
    if (!step || !value.trim()) return;
    setAnswers(previous => ({ ...previous, [step]: value.trim().slice(0, 1200) }));
    setDraft(''); setInputError('');
  };
  const restart = () => { setAnswers({}); setDraft(''); setEditing(false); setInputError(''); setNotes([]); };
  const sendDraft = () => {
    if (stopped) {
      if (!draft.trim()) return;
      setNotes(previous => [...previous, draft.trim()].slice(-20));
      setDraft(''); setInputError(''); return;
    }
    if (!OPTIONS[step]) { submit(draft); return; }
    const normalized = draft.trim().toLowerCase().replace(/[.!?।]+$/g, '');
    const aliases = { yes: ['yes', 'हाँ', 'हां', 'haan', 'ha'], no: ['no', 'नहीं', 'नही', 'nahi', 'nahin'], unsure: ['not sure', 'पता नहीं', 'unsure'], emergency: ['emergency', 'आपात लक्षण'] };
    const matched = OPTIONS[step].find(([value, text]) => value === normalized || text.toLowerCase() === normalized || aliases[value]?.includes(normalized));
    if (matched) submit(matched[0]);
    else setInputError('Please choose one of the answer buttons for this question. अगले सवाल में अपनी परेशानी लिख सकते हैं।');
  };
  const label = (key, value) => OPTIONS[key]?.find(([id]) => id === value)?.[1] || value;
  const question = key => language.prompts[key] || QUESTIONS[key];
  const download = () => {
    const transcript = ['CareVault — patient-reported symptom summary', `Language: ${language.name}`, ...STEPS.filter(key => answers[key]).map(key => `${QUESTIONS[key]}\n${label(key, answers[key])}`), ...notes.map(note => `Additional patient note: ${note}`), 'Guided information, not a diagnosis.', outcome.text || '', outcome.possibilities || ''].join('\n\n');
    const url = URL.createObjectURL(new Blob([transcript], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'carevault-symptom-summary.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="symptom-chat" aria-labelledby="symptom-chat-title">
    <header className="sc-header">
      <div><span className="sc-eyebrow">CAREVAULT · PATIENT SUPPORT</span><h2 id="symptom-chat-title">Health conversation / सेहत की बात</h2><p>Symptoms, timing and medicine history — one question at a time.</p></div>
      <div className="sc-header-actions"><span className="sc-badge">Local guided chat</span><a className="sc-call" href="tel:112" aria-label="Call emergency number 112">☎ Emergency · Call 112</a></div>
    </header>
    <div className="sc-toolbar">
      <label htmlFor="sc-language">Your language / आपकी भाषा</label>
      <select id="sc-language" value={languageCode} onChange={event => setLanguageCode(event.target.value)}>
        {languages.map(item => <option key={item.code} value={item.code}>{item.native} · {item.name}</option>)}
      </select>
      <button type="button" onClick={() => setEditing(true)}>New conversation</button>
    </div>
    {editing && <div className="sc-notice" role="status">Clear this conversation? <button type="button" onClick={restart}>Clear</button> <button type="button" onClick={() => setEditing(false)}>Keep chatting</button></div>}
    <details className="sc-about"><summary>About this guided chat / चैट की जानकारी</summary><p className="sc-note">27 Indian-language input choices + English. {Object.keys(language.prompts).length ? 'Intake prompts are translated; safety questions and summaries use English/Hindi.' : 'Prompts currently use English/Hindi for this language.'} You can type in your own script. Guided chat records free text but does not interpret or translate it.</p>
    <p className="sc-note">This conversation stays in this open dashboard and is cleared when you leave it. No messages are sent to an AI service. It is not a diagnosis and does not recommend medicines.</p></details>
    <details className="sc-danger" >
      <summary>Emergency signs / आपात लक्षण — <a href="tel:112">Call 112</a></summary>
      <p>{EMERGENCY_SIGNS}</p><p lang="hi">{EMERGENCY_HINDI}</p>
      <button type="button" onClick={() => setAnswers(previous => ({ ...previous, danger: 'yes' }))}>I have an emergency sign / आपात लक्षण है</button>
    </details>
    <div ref={transcriptRef} className="sc-conversation" role="log" aria-label="Symptom conversation" aria-live="polite" aria-relevant="additions">
      {STEPS.filter(key => answers[key]).map(key => <div className="sc-exchange" key={key}>
        <div className="sc-bubble sc-assistant"><strong>CareVault</strong><p lang={languageCode} dir={rtl ? 'rtl' : 'auto'}>{question(key)}</p>{language.prompts[key] && <small>{QUESTIONS[key]}</small>}</div>
        <div className="sc-bubble sc-patient"><strong>You / आप</strong><p dir="auto">{label(key, answers[key])}</p></div>
      </div>)}
      {!stopped && <div className="sc-bubble sc-assistant"><strong>CareVault · {STEPS.indexOf(step) + 1}/{STEPS.length}</strong><p lang={languageCode} dir={rtl ? 'rtl' : 'auto'}>{question(step)}</p>{language.prompts[step] && <small>{QUESTIONS[step]}</small>}</div>}
      {stopped && <div className={`sc-result sc-result-${outcome.kind}`} role="status">
        <h3>{outcome.kind === 'emergency' ? 'Get help now / तुरंत मदद लें' : 'Next steps / अगला कदम'}</h3>
        <p>{outcome.text}</p><p lang="hi">{outcome.hindi}</p>
        {outcome.possibilities && <><h4>Possibilities to discuss with a doctor</h4><p>{outcome.possibilities}</p><p lang="hi">{outcome.possibilitiesHindi}</p></>}
        <p>Free-text history has not been clinically assessed. Show your answers to a clinician, especially if pregnant, recently injured, or living with an existing condition.</p>
        <button type="button" onClick={download}>Download my summary</button>
        <button type="button" onClick={() => setEditing(true)}>Start again</button>
      </div>}
      {notes.map((note, index) => <div className="sc-exchange" key={index}><div className="sc-bubble sc-patient"><strong>Additional note / अतिरिक्त जानकारी</strong><p dir="auto">{note}</p></div><div className="sc-bubble sc-assistant"><p>Added to your summary. This note has not been medically assessed. {outcome.kind === 'emergency' ? 'Please get emergency help now; do not wait for chat.' : 'Share it with your clinician.'}</p></div></div>)}
    </div>
    {!stopped && OPTIONS[step] && <div className="sc-options" aria-label={QUESTIONS[step]}>{OPTIONS[step].map(([value, text]) => <button key={value} type="button" onClick={() => submit(value)}>{text}</button>)}</div>}
    <form className="sc-compose" onSubmit={event => { event.preventDefault(); sendDraft(); }}>
      {active && <VoiceDictation key={`${languageCode}:${step}`} language={languageCode} active={active} onText={text => setDraft(previous => appendDictation(previous, text))} />}
      <label htmlFor="sc-message">{stopped ? "Add a note for your doctor / डॉक्टर के लिए जानकारी" : "Your answer / आपका जवाब"}</label>
      {stopped && <small>{outcome.kind === 'emergency' ? "Emergency advice still applies. You can record a note, but do not delay getting help." : "Your summary is ready. You can add a note or start again."}</small>}
      <textarea id="sc-message" dir="auto" value={draft} onChange={event => setDraft(event.target.value)} maxLength={1200} rows={3} placeholder="अपनी परेशानी यहाँ लिखें…" required />
      <div><small>{draft.length}/1200 · Enter adds a new line</small><button type="submit" disabled={!draft.trim()}>{stopped ? "Add to summary / जानकारी जोड़ें" : "Send / भेजें"}</button></div>
      {inputError && <p role="alert">{inputError}</p>}
    </form>
    <footer className="sc-sources">Information sources: {SOURCES.map(([name, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{name}</a>)}</footer>
  </section>;
}
