// ClinicalAttentionCard.jsx — Prominent Red Flag & High-Priority Clinical Alert Banner

export default function ClinicalAttentionCard({ redFlags = [] }) {
  if (!redFlags || redFlags.length === 0) return null;

  return (
    <div className="cr-clinical-attention-wrapper" id="clinical-attention-section">
      <div className="cr-attention-card">
        <div className="cr-attention-header">
          <div className="cr-attention-title-wrap">
            <span className="cr-attention-siren" aria-hidden="true">🚨</span>
            <div>
              <h2 className="cr-attention-title">Clinical Attention — Potential Red Flag Detected</h2>
              <span className="cr-attention-disclaimer">
                Non-definitive clinical observations flagged for physician evaluation. Doctor remains responsible for diagnostic and treatment decisions.
              </span>
            </div>
          </div>
          <span className="cr-priority-tag high">HIGH PRIORITY</span>
        </div>

        <div className="cr-attention-items-list">
          {redFlags.map((item) => (
            <div key={item.id} className="cr-attention-item">
              <div className="cr-attention-item-top">
                <strong className="cr-attention-item-name">{item.title}</strong>
                <span className="cr-attention-action-pill">{item.priorityLabel || 'Requires Physician Review'}</span>
              </div>
              <p className="cr-attention-desc">{item.description}</p>
              <div className="cr-attention-action-box">
                <strong className="cr-action-label">Recommended Action:</strong>
                <span className="cr-action-text">{item.action}</span>
              </div>
              <div className="cr-attention-source-meta">
                <small>Detection Source: {item.source}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
