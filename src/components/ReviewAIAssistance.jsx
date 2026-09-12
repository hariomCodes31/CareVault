import { useState, useMemo, useRef, useEffect } from 'react';
import { getPatients } from '../services/patientService';
import { getClinicalReviewData } from '../services/clinicalReviewService';
import {
  generateAICompanionResponse,
  playVoiceNarration,
  stopVoiceNarration,
} from '../services/aiAssistanceService';
import OriginalDataModals from './review/OriginalDataModals';

import './ReviewAIAssistance.css';

// SVG Icons
const IconSparkles = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconAlertCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconVolume2 = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const IconVolumeX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const IconMic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const IconSend = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Exactly 3 compact quick questions
const THREE_QUICK_QUESTIONS = [
  { id: 'q-summarize', text: 'Summarize this case', icon: '📋' },
  { id: 'q-ask-doctor', text: 'What should I ask the doctor?', icon: '🩺' },
  { id: 'q-missing', text: 'What information is missing?', icon: '⚠️' },
];

export default function ReviewAIAssistance({ onBack, onProceedToDoctor, initialPatientId }) {
  // ── Patient State ─────────────────────────────────────────────────────────
  const [patients] = useState(() => getPatients());
  const [selectedPatientId, setSelectedPatientId] = useState(() => {
    if (initialPatientId) return initialPatientId;
    const defaultPatient = patients.find((p) => p.patientId === 'CV2026-000452') || patients[0];
    return defaultPatient ? defaultPatient.patientId : 'CV2026-000452';
  });

  const activePatient = useMemo(() => {
    return patients.find((p) => p.patientId === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const [reviewData, setReviewData] = useState(() => getClinicalReviewData(selectedPatientId));

  // Medical Documents section collapsed state
  const [isDocsExpanded, setIsDocsExpanded] = useState(false);

  // Modals for Document / Transcript previews
  const [activeModal, setActiveModal] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Missing info resolved state
  const [hasCompletedMissing, setHasCompletedMissing] = useState(false);

  // ── AI Chat & Continuous Voice State ──────────────────────────────────────
  const [patientQuestion, setPatientQuestion] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeAudioIndex, setActiveAudioIndex] = useState(null);
  const [voiceLang, setVoiceLang] = useState('auto'); // 'auto' | 'hi' | 'en'

  // Voice State Machine
  const [voiceState, setVoiceState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'READY' | 'ERROR'
  const [voiceError, setVoiceError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const previousInputTextRef = useRef('');

  const chatMessagesEndRef = useRef(null);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiThinking]);

  useEffect(() => {
    setReviewData(getClinicalReviewData(selectedPatientId));
    setHasCompletedMissing(false);
    stopVoiceNarration();
    setActiveAudioIndex(null);
  }, [selectedPatientId]);

  // ── Continuous Speech-to-Text Setup ─────────────────────────────────────────
  const cleanupRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceState('ERROR');
      setVoiceError("Voice input isn't supported in this browser. You can type your question instead.");
      return;
    }

    cleanupRecognition();
    previousInputTextRef.current = patientQuestion;
    finalTranscriptRef.current = patientQuestion ? `${patientQuestion.trim()} ` : '';
    setInterimTranscript('');
    setVoiceError(null);
    setVoiceState('LISTENING');
    isRecordingRef.current = true;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      if (voiceLang === 'hi') {
        recognition.lang = 'hi-IN';
      } else if (voiceLang === 'en') {
        recognition.lang = 'en-US';
      } else {
        recognition.lang = 'hi-IN';
      }

      recognition.onresult = (event) => {
        let currentInterim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcriptChunk = item[0].transcript;
          if (item.isFinal) {
            finalTranscriptRef.current += `${transcriptChunk.trim()} `;
          } else {
            currentInterim += transcriptChunk;
          }
        }

        setInterimTranscript(currentInterim);
        const fullLiveText = (finalTranscriptRef.current + currentInterim).trim();
        setPatientQuestion(fullLiveText);
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          isRecordingRef.current = false;
          setVoiceState('ERROR');
          setVoiceError('Microphone access is required for voice input. You can allow access in browser settings.');
          cleanupRecognition();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            isRecordingRef.current = false;
            setVoiceState('READY');
          }
        } else {
          setVoiceState('READY');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      isRecordingRef.current = false;
      setVoiceState('ERROR');
      setVoiceError('Could not start voice recognition. Please try typing your question.');
    }
  };

  const stopVoiceRecording = () => {
    isRecordingRef.current = false;
    setVoiceState('PROCESSING');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        cleanupRecognition();
      }
    }
    const finalClean = (finalTranscriptRef.current + interimTranscript).trim();
    setPatientQuestion(finalClean);
    setInterimTranscript('');
    setTimeout(() => {
      setVoiceState('READY');
      cleanupRecognition();
    }, 150);
  };

  const cancelVoiceRecording = () => {
    isRecordingRef.current = false;
    cleanupRecognition();
    setInterimTranscript('');
    setPatientQuestion(previousInputTextRef.current);
    setVoiceState('IDLE');
    setVoiceError(null);
  };

  // ── AI Message Send ─────────────────────────────────────────────────────────
  const handleSendQuestion = async (e) => {
    if (e) e.preventDefault();
    const query = patientQuestion.trim();
    if (!query || isAiThinking) return;

    if (voiceState === 'LISTENING') {
      stopVoiceRecording();
    }

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setPatientQuestion('');
    setInterimTranscript('');
    setIsAiThinking(true);

    try {
      const aiResponseText = await generateAICompanionResponse(query, {
        activePatient,
        caseData: reviewData.summarySections,
      });

      const aiMsg = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg = {
        id: `msg-${Date.now()}-error`,
        sender: 'ai',
        text: "I am having trouble connecting right now. Based on the case record, please review the patient's complaint and vitals directly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleToggleAudio = (index, text) => {
    if (activeAudioIndex === index) {
      stopVoiceNarration();
      setActiveAudioIndex(null);
    } else {
      stopVoiceNarration();
      setActiveAudioIndex(index);
      playVoiceNarration(text, 'en', () => {
        setActiveAudioIndex(null);
      });
    }
  };

  return (
    <div className="step5-container" id="step5-review-ai-container">
      {/* ── Page Header: Clean & Essential ── */}
      <header className="step5-header-card">
        <div className="shc-top">
          <div className="shc-titles">
            <h1 className="step5-main-heading">Review & AI Assistance</h1>
            <p className="step5-sub-heading">
              Review the captured case and ask CareVault AI about the patient's information.
            </p>
          </div>

          <div className="shc-controls">
            <div className="patient-select-wrapper">
              <label htmlFor="patient-selector" className="patient-select-label">
                Patient:
              </label>
              <select
                id="patient-selector"
                className="patient-select-dropdown"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                {patients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.name} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            <span className={`case-status-pill ${hasCompletedMissing ? 'reviewed' : 'attention'}`}>
              {hasCompletedMissing ? (
                <>
                  <IconCheck /> ✓ Case Reviewed
                </>
              ) : (
                <>
                  <IconAlertCircle /> ⚠ Needs Attention
                </>
              )}
            </span>
          </div>
        </div>

        {/* Essential Patient Information Strip Only */}
        <div className="shc-patient-strip">
          <div className="patient-meta-item">
            <span className="pmi-label">Patient Name</span>
            <strong className="pmi-value">{activePatient.name}</strong>
          </div>
          <div className="patient-meta-divider" aria-hidden="true" />
          <div className="patient-meta-item">
            <span className="pmi-label">Patient ID</span>
            <span className="pmi-code">{activePatient.patientId}</span>
          </div>
          <div className="patient-meta-divider" aria-hidden="true" />
          <div className="patient-meta-item">
            <span className="pmi-label">Visit Type</span>
            <span className="pmi-value">{reviewData.patient.visitType}</span>
          </div>
          <div className="patient-meta-divider" aria-hidden="true" />
          <div className="patient-meta-item">
            <span className="pmi-label">Date</span>
            <span className="pmi-value">{reviewData.patient.visitDate}</span>
          </div>
        </div>
      </header>

      {/* ── Main Two-Column Clean Layout: LEFT = Case Review, RIGHT = AI Assistant ── */}
      <div className="step5-main-grid">
        {/* ==================================================================
            1. CASE REVIEW (LEFT)
            ================================================================== */}
        <section className="step5-review-col" aria-label="Case Review">
          <div className="simple-card case-review-card">
            <div className="card-header-clean">
              <h2 className="card-title-clean">Case Review</h2>
              <span className="card-tag-sub">Intake Summary & Findings</span>
            </div>

            {/* 1a. Clinical Attention Indicator */}
            <div className="simple-alert-box red-flag">
              <span className="alert-siren" aria-hidden="true">🚨</span>
              <div className="alert-text-group">
                <strong className="alert-strong">Clinical Attention: Potential Red Flag Detected</strong>
                <p className="alert-p">
                  Persistent fever for 3 days (101.4 °F) with frontal headache and body ache. Requires physician examination to rule out acute febrile illness.
                </p>
              </div>
            </div>

            {/* 1b. Case Summary */}
            <div className="review-block">
              <h3 className="block-title">Chief Complaint</h3>
              <p className="block-body highlight">
                Fever for 3 days (highest recorded 101.4 °F) associated with mild frontal headache, myalgia, and general weakness.
              </p>
            </div>

            {/* 1c. Important Findings (Vitals & Key Labs) */}
            <div className="review-block">
              <h3 className="block-title">Important Findings</h3>

              {/* Vitals Grid */}
              <div className="compact-vitals-grid">
                <div className="vital-item">
                  <span className="vital-k">Temperature</span>
                  <strong className="vital-v warning">101.4 °F</strong>
                </div>
                <div className="vital-item">
                  <span className="vital-k">Heart Rate</span>
                  <strong className="vital-v">98 bpm</strong>
                </div>
                <div className="vital-item">
                  <span className="vital-k">Blood Pressure</span>
                  <strong className="vital-v">120/80 mmHg</strong>
                </div>
                <div className="vital-item">
                  <span className="vital-k">SpO2</span>
                  <strong className="vital-v">98%</strong>
                </div>
              </div>

              {/* Key Bulleted Findings */}
              <ul className="findings-bullet-list">
                <li>
                  <strong>Lab (CBC):</strong> Hemoglobin 10.2 g/dL (mild anemia), WBC 8,400 /µL (normal), Platelets 185,000 /µL.
                </li>
                <li>
                  <strong>Active Medication:</strong> Tab Paracetamol 650mg SOS (2 doses taken in last 24h).
                </li>
                <li>
                  <strong>History:</strong> Open appendectomy in 2019 (uneventful recovery). No diabetes or hypertension.
                </li>
              </ul>
            </div>

            {/* 1d. Missing Information */}
            <div className="review-block">
              <h3 className="block-title">Case Status & Missing Information</h3>
              {hasCompletedMissing ? (
                <div className="missing-status-box complete">
                  <span>✓ All essential intake information reviewed & recorded.</span>
                </div>
              ) : (
                <div className="missing-status-box pending">
                  <div className="missing-status-left">
                    <span className="missing-dot">⚠</span>
                    <div>
                      <strong>1 important field missing</strong>
                      <span className="missing-hint">Drug allergy history not formally confirmed.</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-complete-missing"
                    onClick={() => setActiveModal('complete-case')}
                  >
                    Review Missing Information
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Review Action Buttons */}
            <div className="case-review-actions-row">
              {onBack && (
                <button type="button" className="btn-clean-back" onClick={onBack}>
                  ← Back to Case Taking
                </button>
              )}
              {onProceedToDoctor && (
                <button type="button" className="btn-clean-proceed" onClick={onProceedToDoctor}>
                  Proceed to Doctor Workspace →
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================================
            2. CAREVAULT AI ASSISTANT (RIGHT — HERO)
            ================================================================== */}
        <section className="step5-assistant-col" aria-label="CareVault AI Assistant">
          <div className="simple-card ai-assistant-hero-card">
            {/* Header */}
            <div className="ai-hero-header">
              <div className="ai-hero-title-group">
                <span className="ai-sparkle-badge" aria-hidden="true">
                  <IconSparkles />
                </span>
                <div>
                  <h2 className="ai-hero-title">✨ CareVault AI Assistant</h2>
                  <p className="ai-hero-sub">
                    Ask me about this patient's case or health records.
                  </p>
                </div>
              </div>

              {/* Language Selector: English | हिन्दी | Auto */}
              <div className="voice-lang-selector" title="Select Voice Language">
                <span className="lang-label">Voice:</span>
                <button
                  type="button"
                  className={`lang-btn ${voiceLang === 'en' ? 'active' : ''}`}
                  onClick={() => setVoiceLang('en')}
                >
                  English
                </button>
                <button
                  type="button"
                  className={`lang-btn ${voiceLang === 'hi' ? 'active' : ''}`}
                  onClick={() => setVoiceLang('hi')}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  className={`lang-btn ${voiceLang === 'auto' ? 'active' : ''}`}
                  onClick={() => setVoiceLang('auto')}
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Informational Disclaimer */}
            <div className="ai-disclaimer-strip">
              <span>ℹ AI assistance is informational and does not replace professional medical advice.</span>
            </div>

            {/* Conversation Area */}
            <div className="ai-chat-body" role="log" aria-live="polite">
              {chatHistory.length === 0 ? (
                <div className="ai-empty-state">
                  <div className="empty-sparkle-icon" aria-hidden="true">
                    <IconSparkles />
                  </div>
                  <h3 className="empty-heading">Ask anything about {activePatient.name}'s case</h3>
                  <p className="empty-sub">
                    Use quick questions below or tap the microphone for natural speech.
                  </p>

                  {/* Exactly 3 Compact Quick Questions */}
                  <div className="three-quick-questions">
                    {THREE_QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        className="quick-q-btn"
                        onClick={() => setPatientQuestion(q.text)}
                      >
                        <span className="q-icon">{q.icon}</span>
                        <span className="q-text">{q.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chat-messages-stream">
                  {chatHistory.map((msg, idx) => (
                    <div key={msg.id || idx} className={`chat-message-row ${msg.sender}`}>
                      {msg.sender === 'ai' && (
                        <div className="msg-avatar ai" aria-hidden="true">
                          <IconSparkles />
                        </div>
                      )}

                      <div className={`chat-bubble-container ${msg.sender}`}>
                        <div className="chat-bubble-content">
                          {msg.text.split('\n').map((para, pIdx) => {
                            if (!para.trim()) return null;
                            if (para.startsWith('**') && para.endsWith('**')) {
                              return (
                                <h4 key={pIdx} className="bubble-h4">
                                  {para.replace(/\*\*/g, '')}
                                </h4>
                              );
                            }
                            if (para.startsWith('- ') || para.startsWith('• ')) {
                              return (
                                <li key={pIdx} className="bubble-li">
                                  {para.replace(/^[-•]\s*/, '')}
                                </li>
                              );
                            }
                            return (
                              <p key={pIdx} className="bubble-p">
                                {para}
                              </p>
                            );
                          })}
                        </div>

                        <div className="msg-meta-bar">
                          <span className="msg-timestamp">{msg.timestamp}</span>

                          {msg.sender === 'ai' && (
                            <button
                              type="button"
                              className={`audio-tts-btn ${activeAudioIndex === idx ? 'playing' : ''}`}
                              onClick={() => handleToggleAudio(idx, msg.text)}
                              title="Listen to message audio"
                            >
                              {activeAudioIndex === idx ? (
                                <>
                                  <IconVolumeX />
                                  <span>Stop Audio</span>
                                </>
                              ) : (
                                <>
                                  <IconVolume2 />
                                  <span>Listen Audio</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="msg-avatar user" aria-hidden="true">
                          <IconUser />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI Generating Typing Dots */}
                  {isAiThinking && (
                    <div className="chat-message-row ai">
                      <div className="msg-avatar ai" aria-hidden="true">
                        <IconSparkles />
                      </div>
                      <div className="chat-bubble-container ai generating">
                        <div className="typing-dots-indicator" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </div>
                        <span className="generating-text">CareVault AI is thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>
              )}
            </div>

            {/* Listening State Banner */}
            {voiceState === 'LISTENING' && (
              <div className="voice-recording-banner">
                <div className="voice-recording-left">
                  <span className="recording-red-dot" aria-hidden="true" />
                  <div>
                    <strong className="recording-title">🔴 Listening...</strong>
                    <span className="recording-hint">
                      Speak naturally. Tap Stop when you're finished.
                    </span>
                  </div>
                </div>

                <div className="voice-recording-actions">
                  <button
                    type="button"
                    className="btn-voice-cancel"
                    onClick={cancelVoiceRecording}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-voice-stop"
                    onClick={stopVoiceRecording}
                  >
                    Stop
                  </button>
                </div>
              </div>
            )}

            {/* Voice Error Fallback Banner */}
            {voiceError && (
              <div className="voice-error-banner">
                <IconAlertCircle />
                <span>{voiceError}</span>
                <button
                  type="button"
                  className="btn-error-dismiss"
                  onClick={() => setVoiceError(null)}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Chat Input Bar: User manually presses Send */}
            <form className="ai-input-form" onSubmit={handleSendQuestion}>
              <div className="input-box-wrapper">
                <input
                  type="text"
                  className={`ai-text-input ${voiceState === 'LISTENING' ? 'recording-active' : ''}`}
                  value={patientQuestion}
                  onChange={(e) => setPatientQuestion(e.target.value)}
                  placeholder={
                    voiceState === 'LISTENING'
                      ? 'Listening to natural speech (Hindi, English, Hinglish)...'
                      : 'Ask about this patient’s case or health records...'
                  }
                  disabled={isAiThinking}
                />

                {/* Microphone Button */}
                <button
                  type="button"
                  className={`mic-trigger-btn ${voiceState === 'LISTENING' ? 'listening' : ''}`}
                  onClick={voiceState === 'LISTENING' ? stopVoiceRecording : startVoiceRecording}
                  title={voiceState === 'LISTENING' ? 'Stop Recording' : 'Start Voice Input'}
                >
                  <IconMic />
                  <span className="mic-btn-label">
                    {voiceState === 'LISTENING' ? 'Stop' : 'Voice'}
                  </span>
                </button>
              </div>

              {/* Manual Send Button */}
              <button
                type="submit"
                className="ai-send-btn"
                disabled={!patientQuestion.trim() || isAiThinking}
                id="btn-send-chat"
              >
                <IconSend />
                <span className="send-btn-label">Send</span>
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* ==================================================================
          3. MEDICAL DOCUMENTS (BOTTOM — COMPACT COLLAPSED SECTION)
          ================================================================== */}
      <footer className="step5-documents-bar" aria-label="Medical Documents">
        <div className="simple-card docs-compact-card">
          <div className="docs-compact-header">
            <div className="docs-compact-info">
              <span className="docs-folder-icon" aria-hidden="true">📁</span>
              <div>
                <strong className="docs-compact-title">Medical Documents (3 Records Digitized)</strong>
                <span className="docs-compact-sub">
                  CBC Lab Report (Jan 11, 2026), OPD Prescription (Jan 10, 2026), Appendectomy Summary (2019)
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-toggle-docs"
              onClick={() => setIsDocsExpanded((prev) => !prev)}
            >
              {isDocsExpanded ? 'Hide Documents ▲' : 'View Documents ▼'}
            </button>
          </div>

          {/* Expandable Document Items */}
          {isDocsExpanded && (
            <div className="docs-expanded-drawer">
              <div className="docs-compact-grid">
                {reviewData.documentInsights.map((doc) => (
                  <div key={doc.id} className="doc-compact-item">
                    <div className="doc-item-top">
                      <span className="doc-badge-pill">{doc.type}</span>
                      <span className="doc-date-text">{doc.date}</span>
                    </div>
                    <strong className="doc-name-text">{doc.name}</strong>
                    <div className="doc-facility-text">{doc.facility}</div>
                    <div className="doc-ocr-summary">✓ {doc.ocrStatus} · {doc.extractedCount}</div>
                    <div className="doc-item-buttons">
                      <button
                        type="button"
                        className="btn-doc-action"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setActiveModal('document');
                        }}
                      >
                        📄 View Original
                      </button>
                      <button
                        type="button"
                        className="btn-doc-action"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setActiveModal('ocr');
                        }}
                      >
                        🔍 View Extracted Text
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </footer>

      {/* ── Document / Modal Previews ── */}
      <OriginalDataModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        patientAnswers={reviewData.originalPatientAnswers}
        transcript={reviewData.originalTranscript}
        selectedDocument={selectedDocument}
        onCompleteCaseFields={() => setHasCompletedMissing(true)}
      />
    </div>
  );
}
