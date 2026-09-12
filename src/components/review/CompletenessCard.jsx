// CompletenessCard.jsx — Case Completeness indicator with progress gauge and clinical section checklist

export default function CompletenessCard({ completeness, onCompleteCase }) {
  const { percentage, missingCount, checklist } = completeness;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const isComplete = missingCount === 0;

  return (
    <div className="cr-completeness-card" id="case-completeness-section">
      <div className="cr-comp-top">
        <div className="cr-comp-header-group">
          <div className="cr-section-eyebrow">Intake Verification</div>
          <h2 className="cr-comp-title">Clinical Case Completeness</h2>
          <p className="cr-comp-subtitle">
            Evaluating structured intake data against standard clinical documentation requirements.
          </p>
        </div>

        {/* Progress Circular Gauge */}
        <div className="cr-comp-ring-wrapper">
          <svg className="cr-comp-ring-svg" width="96" height="96" viewBox="0 0 96 96">
            <circle
              className="cr-comp-ring-bg"
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
            <circle
              className={`cr-comp-ring-progress ${percentage >= 90 ? 'high' : percentage >= 75 ? 'medium' : 'low'}`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="48"
              cy="48"
            />
          </svg>
          <div className="cr-comp-ring-value">
            <span className="cr-comp-pct">{percentage}%</span>
            <span className="cr-comp-label">Complete</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Mobile / Linear fallback) */}
      <div className="cr-comp-linear-bar" aria-hidden="true">
        <div
          className="cr-comp-linear-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Section Checklist Grid */}
      <div className="cr-comp-checklist-grid">
        {checklist.map((item) => (
          <div
            key={item.id}
            className={`cr-comp-check-item ${item.isComplete ? 'complete' : 'missing'}`}
          >
            <span className="cr-comp-check-icon" aria-hidden="true">
              {item.isComplete ? '✓' : '⚠'}
            </span>
            <span className="cr-comp-check-text">{item.title}</span>
          </div>
        ))}
      </div>

      {/* Missing Information Alert Banner & Complete Action */}
      <div className={`cr-comp-action-banner ${isComplete ? 'verified' : 'attention'}`}>
        <div className="cr-comp-action-info">
          {isComplete ? (
            <>
              <div className="cr-comp-status-text success">✓ All core clinical sections recorded</div>
              <div className="cr-comp-status-sub">Ready for physician sign-off and clinical verification.</div>
            </>
          ) : (
            <>
              <div className="cr-comp-status-text warning">
                ⚠ {missingCount} important {missingCount === 1 ? 'field' : 'fields'} missing
              </div>
              <div className="cr-comp-status-sub">
                Complete missing information before verification to ensure patient safety.
              </div>
            </>
          )}
        </div>

        {!isComplete && (
          <button
            type="button"
            className="cr-btn-complete-case"
            onClick={onCompleteCase}
            id="btn-complete-case"
          >
            Complete Case
          </button>
        )}
      </div>
    </div>
  );
}
