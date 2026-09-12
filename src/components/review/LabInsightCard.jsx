export default function LabInsightCard({
  labInsights = [],
  onViewOriginalReport,
  onViewExtractedText,
}) {
  if (!labInsights || labInsights.length === 0) return null;

  return (
    <div className="cr-lab-insights-card" id="lab-insights-section">
      <div className="cr-card-header-bar">
        <div className="cr-card-title-wrap">
          <span className="cr-card-header-icon" aria-hidden="true">🧪</span>
          <div>
            <div className="cr-section-eyebrow">Diagnostic Lab OCR Extraction</div>
            <h3 className="cr-card-title">Lab / Abnormal Value Insights</h3>
            <span className="cr-card-sub">
              Automated optical recognition from uploaded laboratory reports with reference range cross-validation.
            </span>
          </div>
        </div>

        <div className="cr-lab-actions">
          <button
            type="button"
            className="cr-btn-outline-secondary"
            onClick={onViewOriginalReport}
          >
            📄 View Original Report
          </button>
          <button
            type="button"
            className="cr-btn-outline-secondary"
            onClick={onViewExtractedText}
          >
            🔍 View Extracted Text
          </button>
        </div>
      </div>

      <div className="cr-table-responsive">
        <table className="cr-lab-table">
          <thead>
            <tr>
              <th>Test Parameter</th>
              <th>Extracted Value</th>
              <th>Unit</th>
              <th>Reference Range</th>
              <th>Clinical Status</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {labInsights.map((item) => (
              <tr
                key={item.id}
                className={item.status === 'abnormal' ? 'row-abnormal' : 'row-normal'}
              >
                <td className="cell-test-name">
                  <strong>{item.test}</strong>
                </td>
                <td className="cell-value">
                  <span className={`cr-val-badge ${item.status}`}>
                    {item.value}
                  </span>
                </td>
                <td className="cell-unit">{item.unit}</td>
                <td className="cell-ref">{item.referenceRange}</td>
                <td className="cell-status">
                  <span className={`cr-status-tag ${item.status}`}>
                    {item.statusLabel}
                  </span>
                </td>
                <td className="cell-interpret">
                  <small>{item.interpretation}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
