import { useState } from 'react';

export default function MissingInformationAlert({
  missingItems = [],
  onSendQuestionToCaseTaking,
}) {
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [sentQuestions, setSentQuestions] = useState({});

  if (!missingItems || missingItems.length === 0) return null;

  const handleToggleQuestion = (id) => {
    setActiveQuestionId((prev) => (prev === id ? null : id));
  };

  const handleSendQuestion = (item) => {
    setSentQuestions((prev) => ({ ...prev, [item.id]: true }));
    if (onSendQuestionToCaseTaking) {
      onSendQuestionToCaseTaking(item.suggestedQuestion);
    }
  };

  return (
    <div className="cr-missing-info-card" id="missing-info-section">
      <div className="cr-missing-header">
        <div className="cr-missing-title-wrap">
          <span className="cr-missing-icon" aria-hidden="true">⚠</span>
          <div>
            <h3 className="cr-missing-title">AI Missing Information Detection</h3>
            <span className="cr-missing-sub">
              Unrecorded clinical data points detected. Recommended follow-up inquiries generated for intake completion.
            </span>
          </div>
        </div>
        <span className="cr-missing-count-badge">
          {missingItems.length} {missingItems.length === 1 ? 'Item' : 'Items'} Pending
        </span>
      </div>

      <div className="cr-missing-items-list">
        {missingItems.map((item) => {
          const isQuestionOpen = activeQuestionId === item.id;
          const isSent = sentQuestions[item.id];

          return (
            <div key={item.id} className="cr-missing-item-row">
              <div className="cr-missing-item-info">
                <div className="cr-missing-item-field">
                  <span className="cr-missing-bullet">⚠</span>
                  <strong>{item.field}</strong>
                  <span className="cr-missing-status-tag">{item.status}</span>
                </div>
                <p className="cr-missing-desc">{item.description}</p>
              </div>

              <div className="cr-missing-item-action">
                <button
                  type="button"
                  className={`cr-btn-ask-followup ${isQuestionOpen ? 'active' : ''}`}
                  onClick={() => handleToggleQuestion(item.id)}
                >
                  {isQuestionOpen ? 'Hide Question ▲' : 'Ask Follow-up Question ▼'}
                </button>
              </div>

              {/* Expandable Clinically Targeted Question Card */}
              {isQuestionOpen && (
                <div className="cr-followup-question-box">
                  <div className="cr-question-tag">Clinically Targeted Question</div>
                  <p className="cr-question-text">"{item.suggestedQuestion}"</p>
                  <div className="cr-question-footer">
                    <button
                      type="button"
                      className={`cr-btn-send-question ${isSent ? 'sent' : ''}`}
                      onClick={() => handleSendQuestion(item)}
                      disabled={isSent}
                    >
                      {isSent ? '✓ Sent to Case Taking' : 'Send Question to Case Taking'}
                    </button>
                    <span className="cr-question-hint">
                      Transfers inquiry to patient intake module / AI companion for audio-guided response.
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
