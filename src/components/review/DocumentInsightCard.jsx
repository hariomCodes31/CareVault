export default function DocumentInsightCard({
  documents = [],
  onViewOriginal,
  onViewExtractedText,
}) {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="cr-documents-card" id="documents-ocr-section">
      <div className="cr-card-header-bar">
        <div className="cr-card-title-wrap">
          <span className="cr-card-header-icon" aria-hidden="true">📁</span>
          <div>
            <div className="cr-section-eyebrow">Medical Document Digitization</div>
            <h3 className="cr-card-title">Document Insights & OCR Extraction</h3>
            <span className="cr-card-sub">
              Uploaded physical records, prescriptions, and lab panels digitized via automated medical OCR.
            </span>
          </div>
        </div>
      </div>

      <div className="cr-documents-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="cr-doc-box">
            <div className="cr-doc-box-top">
              <span className="cr-doc-type-badge">{doc.type}</span>
              <span className="cr-doc-date">{doc.date}</span>
            </div>

            <h4 className="cr-doc-name">{doc.name}</h4>
            <div className="cr-doc-facility">{doc.facility}</div>

            <div className="cr-doc-ocr-status">
              <span className="cr-ocr-pill">✓ {doc.ocrStatus}</span>
              <span className="cr-ocr-pill extracted">✓ {doc.extractedCount}</span>
              {doc.abnormalCount && !doc.abnormalCount.includes('0') && (
                <span className="cr-ocr-pill abnormal">⚠ {doc.abnormalCount}</span>
              )}
            </div>

            <div className="cr-doc-actions">
              <button
                type="button"
                className="cr-btn-doc-view"
                onClick={() => onViewOriginal(doc)}
              >
                📄 View Original
              </button>
              <button
                type="button"
                className="cr-btn-doc-text"
                onClick={() => onViewExtractedText(doc)}
              >
                🔍 View Extracted Text
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
