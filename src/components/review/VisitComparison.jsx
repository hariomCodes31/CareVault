export default function VisitComparison({ visitComparison }) {
  if (!visitComparison) return null;

  const { previousDate, currentDate, comparisons = [] } = visitComparison;

  return (
    <div className="cr-visit-comparison-card" id="visit-comparison-section">
      <div className="cr-card-header-bar">
        <div className="cr-card-title-wrap">
          <span className="cr-card-header-icon" aria-hidden="true">🔄</span>
          <div>
            <div className="cr-section-eyebrow">Longitudinal Clinical History</div>
            <h3 className="cr-card-title">Previous vs Current Visit Comparison</h3>
            <span className="cr-card-sub">
              Comparative overview highlighting acute changes from the last recorded outpatient encounter.
            </span>
          </div>
        </div>

        <div className="cr-visit-dates-meta">
          <span className="cr-date-pill prev">Previous: {previousDate}</span>
          <span className="cr-date-arrow">→</span>
          <span className="cr-date-pill current">Current: {currentDate}</span>
        </div>
      </div>

      <div className="cr-comparison-grid">
        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className={`cr-comparison-box ${item.hasChanged ? 'changed' : 'stable'}`}
          >
            <div className="cr-comp-box-header">
              <strong className="cr-param-title">{item.parameter}</strong>
              <span className={`cr-param-badge ${item.hasChanged ? 'delta' : 'neutral'}`}>
                {item.badge}
              </span>
            </div>

            <div className="cr-comp-split">
              <div className="cr-comp-col prev">
                <span className="cr-col-label">Previous Encounter</span>
                <p className="cr-col-content">{item.previous}</p>
              </div>

              <div className="cr-comp-divider" aria-hidden="true">⇄</div>

              <div className="cr-comp-col curr">
                <span className="cr-col-label">Current Intake</span>
                <p className="cr-col-content">{item.current}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
