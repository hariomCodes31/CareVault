import { useState } from 'react';

export default function OriginalDataModals({
  activeModal,
  onClose,
  patientAnswers = [],
  transcript = '',
  selectedDocument = null,
  onCompleteCaseFields,
}) {
  // Complete Case form state
  const [allergyInput, setAllergyInput] = useState('No known drug allergies (NKDA). Mild seasonal allergic rhinitis.');
  const [rosInput, setRosInput] = useState('Constitutional: Positive fever and malaise. Negative for dyspnea, chest pain, nausea, or active focal neurological deficit.');

  if (!activeModal) return null;

  return (
    <div className="cr-modal-backdrop" role="dialog" aria-modal="true">
      <div className="cr-modal-dialog cr-modal-lg">
        {/* Modal: Original Patient Answers */}
        {activeModal === 'answers' && (
          <>
            <div className="cr-modal-header">
              <span className="cr-modal-icon-shield" aria-hidden="true">📋</span>
              <div>
                <h3 className="cr-modal-title">Original Patient Intake Responses</h3>
                <small className="cr-modal-subtitle">Raw responses captured during registration & case-taking</small>
              </div>
            </div>

            <div className="cr-modal-body">
              <div className="cr-raw-answers-list">
                {patientAnswers.map((item, idx) => (
                  <div key={idx} className="cr-raw-answer-item">
                    <strong className="cr-raw-q">{idx + 1}. {item.question}</strong>
                    <div className="cr-raw-a">"{item.answer}"</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cr-modal-footer">
              <button type="button" className="cr-btn-modal-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {/* Modal: Original Voice Transcript */}
        {activeModal === 'transcript' && (
          <>
            <div className="cr-modal-header">
              <span className="cr-modal-icon-shield" aria-hidden="true">🎙</span>
              <div>
                <h3 className="cr-modal-title">Original Patient Voice Audio Transcript</h3>
                <small className="cr-modal-subtitle">Verbatim speech captured by CareVault Voice Intake</small>
              </div>
            </div>

            <div className="cr-modal-body">
              <div className="cr-transcript-box">
                <pre className="cr-transcript-pre">{transcript}</pre>
              </div>
              <p className="cr-transcript-note">
                ℹ CareVault Voice Engine maintains continuous multi-lingual buffer preserving exact spoken phrasing.
              </p>
            </div>

            <div className="cr-modal-footer">
              <button type="button" className="cr-btn-modal-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {/* Modal: Original Uploaded Document */}
        {activeModal === 'document' && (
          <>
            <div className="cr-modal-header">
              <span className="cr-modal-icon-shield" aria-hidden="true">📄</span>
              <div>
                <h3 className="cr-modal-title">{selectedDocument?.name || 'Original Medical Document'}</h3>
                <small className="cr-modal-subtitle">
                  {selectedDocument?.facility || 'Diagnostic Facility'} · {selectedDocument?.date}
                </small>
              </div>
            </div>

            <div className="cr-modal-body">
              <div className="cr-doc-preview-container">
                <div className="cr-doc-mock-scan">
                  <div className="cr-mock-scan-header">
                    <strong>{selectedDocument?.facility?.toUpperCase() || 'HOSPITAL CLINICAL RECORD'}</strong>
                    <span>DATE: {selectedDocument?.date}</span>
                  </div>
                  <div className="cr-mock-scan-body">
                    <pre>{selectedDocument?.rawText || 'Document scan image preview unavailable.'}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="cr-modal-footer">
              <button type="button" className="cr-btn-modal-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {/* Modal: Raw OCR Extracted Text */}
        {activeModal === 'ocr' && (
          <>
            <div className="cr-modal-header">
              <span className="cr-modal-icon-shield" aria-hidden="true">🔍</span>
              <div>
                <h3 className="cr-modal-title">OCR Extracted Text Stream</h3>
                <small className="cr-modal-subtitle">Direct optical character stream with bounding box parsing</small>
              </div>
            </div>

            <div className="cr-modal-body">
              <div className="cr-transcript-box">
                <pre className="cr-transcript-pre">
                  {selectedDocument?.rawText || 'No OCR text available for selected record.'}
                </pre>
              </div>
            </div>

            <div className="cr-modal-footer">
              <button type="button" className="cr-btn-modal-cancel" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        )}

        {/* Modal: Complete Missing Case Information */}
        {activeModal === 'complete-case' && (
          <>
            <div className="cr-modal-header">
              <span className="cr-modal-icon-shield" aria-hidden="true">✏️</span>
              <div>
                <h3 className="cr-modal-title">Complete Missing Case Information</h3>
                <small className="cr-modal-subtitle">Record pending clinical safety fields before physician verification</small>
              </div>
            </div>

            <div className="cr-modal-body">
              <div className="cr-field-group">
                <label className="cr-field-label">
                  <strong>Allergy History (Drug, Food, Environmental)</strong>
                  <span className="cr-required-star">*</span>
                </label>
                <textarea
                  className="cr-field-textarea"
                  rows={3}
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  placeholder="Specify any known allergies (e.g. penicillin, sulfa, NSAIDs) or state NKDA..."
                />
              </div>

              <div className="cr-field-group" style={{ marginTop: '1rem' }}>
                <label className="cr-field-label">
                  <strong>Review of Systems (ROS)</strong>
                  <span className="cr-required-star">*</span>
                </label>
                <textarea
                  className="cr-field-textarea"
                  rows={3}
                  value={rosInput}
                  onChange={(e) => setRosInput(e.target.value)}
                  placeholder="Specify respiratory, cardiovascular, and neurological symptoms..."
                />
              </div>
            </div>

            <div className="cr-modal-footer">
              <button type="button" className="cr-btn-modal-cancel" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="cr-btn-modal-confirm"
                onClick={() => {
                  if (onCompleteCaseFields) {
                    onCompleteCaseFields({
                      allergyText: allergyInput,
                      rosText: rosInput,
                    });
                  }
                  onClose();
                }}
              >
                Save & Update Completeness
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
