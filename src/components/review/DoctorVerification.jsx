import { useState } from 'react';

export default function DoctorVerification({
  isVerified,
  verifiedTimestamp,
  physicianInfo,
  onSaveDraft,
  onToggleEditSummary,
  isEditingGlobal,
  onConfirmVerify,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  const handleSaveDraftClick = () => {
    if (onSaveDraft) onSaveDraft();
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 3000);
  };

  const handleVerifyClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmVerification = () => {
    setShowConfirmModal(false);
    if (onConfirmVerify) onConfirmVerify();
  };

  return (
    <div className="cr-verification-container" id="doctor-verification-section">
      {draftSavedToast && (
        <div className="cr-toast-banner success">
          ✓ Clinical draft saved successfully to CareVault local session.
        </div>
      )}

      {isVerified ? (
        <div className="cr-verified-badge-card">
          <div className="cr-verified-left">
            <span className="cr-verified-shield-icon" aria-hidden="true">✓</span>
            <div>
              <div className="cr-verified-title">
                ✓ Clinically Reviewed · Verified by Physician
              </div>
              <div className="cr-verified-details">
                Physician: <strong>{physicianInfo?.name || 'Dr. Ananya Sharma, MD'}</strong> · Registration: {physicianInfo?.regNo || 'MCI-2024-8842'}
              </div>
              <div className="cr-verified-timestamp">
                Timestamp: <strong>{verifiedTimestamp}</strong>
              </div>
            </div>
          </div>

          <div className="cr-verified-actions">
            <button
              type="button"
              className="cr-btn-outline-secondary"
              onClick={handleSaveDraftClick}
            >
              Update Record
            </button>
          </div>
        </div>
      ) : (
        <div className="cr-actions-bar">
          <div className="cr-actions-meta">
            <span className="cr-actions-status-dot pending" />
            <span className="cr-actions-status-label">
              Status: <strong>Pending Physician Verification</strong>
            </span>
          </div>

          <div className="cr-actions-buttons-group">
            <button
              type="button"
              className="cr-btn-secondary"
              onClick={handleSaveDraftClick}
              id="btn-save-draft"
            >
              💾 Save Draft
            </button>

            <button
              type="button"
              className={`cr-btn-secondary ${isEditingGlobal ? 'active' : ''}`}
              onClick={onToggleEditSummary}
              id="btn-edit-summary"
            >
              {isEditingGlobal ? '✓ Done Editing' : '✎ Edit Summary'}
            </button>

            <button
              type="button"
              className="cr-btn-verify-primary"
              onClick={handleVerifyClick}
              id="btn-verify-summary"
            >
              ✓ Verify Summary
            </button>
          </div>
        </div>
      )}

      {/* Verification Confirmation Modal */}
      {showConfirmModal && (
        <div className="cr-modal-backdrop" role="dialog" aria-modal="true">
          <div className="cr-modal-dialog">
            <div className="cr-modal-header">
              <span className="cr-modal-icon-shield" aria-hidden="true">🩺</span>
              <h3 className="cr-modal-title">Confirm Clinical Verification</h3>
            </div>

            <div className="cr-modal-body">
              <p className="cr-modal-lead">
                Please confirm that you have reviewed the AI-generated summary and supporting information.
              </p>

              <div className="cr-modal-check-list">
                <div className="cr-modal-check-row">
                  ✓ Chief complaint, vitals, and clinical history have been reviewed.
                </div>
                <div className="cr-modal-check-row">
                  ✓ Abnormal lab values and medication interactions have been evaluated.
                </div>
                <div className="cr-modal-check-row">
                  ✓ Final diagnosis and treatment plan remain under attending physician responsibility.
                </div>
              </div>

              <div className="cr-modal-physician-box">
                <small>Attending Physician:</small>
                <strong>{physicianInfo?.name || 'Dr. Ananya Sharma, MD'}</strong>
                <span>License / Reg: {physicianInfo?.regNo || 'MCI-2024-8842'}</span>
              </div>
            </div>

            <div className="cr-modal-footer">
              <button
                type="button"
                className="cr-btn-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cr-btn-modal-confirm"
                onClick={handleConfirmVerification}
                id="btn-confirm-and-verify"
              >
                ✓ Confirm & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
