export default function MedicationInsightCard({
  medications = [],
  interactions = [],
}) {
  return (
    <div className="cr-medication-insights-card" id="medication-insights-section">
      <div className="cr-card-header-bar">
        <div className="cr-card-title-wrap">
          <span className="cr-card-header-icon" aria-hidden="true">💊</span>
          <div>
            <div className="cr-section-eyebrow">Pharmacological Reconciliation</div>
            <h3 className="cr-card-title">Medication Insights & Active Regimen</h3>
            <span className="cr-card-sub">
              Extracted from patient voice intake, historical prescriptions, and uploaded OPD notes.
            </span>
          </div>
        </div>
      </div>

      {/* Potential Medication Interaction Warning */}
      {interactions && interactions.length > 0 && (
        <div className="cr-interaction-warning-banner">
          <div className="cr-interaction-header">
            <span className="cr-interaction-icon" aria-hidden="true">⚠</span>
            <div>
              <strong className="cr-interaction-title">Potential Medication Interaction Detected</strong>
              <span className="cr-interaction-sub">Review recommended · Final decision belongs to the prescribing physician</span>
            </div>
            <span className="cr-interaction-badge">Review Recommended</span>
          </div>

          {interactions.map((warn) => (
            <div key={warn.id} className="cr-interaction-item">
              <p className="cr-interaction-desc">{warn.description}</p>
              <div className="cr-interaction-action">
                <strong>Safety Recommendation:</strong> {warn.action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medication Table */}
      <div className="cr-table-responsive">
        <table className="cr-med-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {medications.map((med) => (
              <tr key={med.id}>
                <td className="cell-med-name">
                  <strong>{med.medicine}</strong>
                </td>
                <td>{med.dosage}</td>
                <td>{med.frequency}</td>
                <td>{med.duration}</td>
                <td>
                  <span className="cr-med-source-tag">
                    {med.source}
                  </span>
                </td>
                <td>
                  <span className="cr-active-tag">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
