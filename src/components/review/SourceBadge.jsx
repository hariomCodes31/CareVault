// SourceBadge.jsx — Source and Confidence indicator for clinical data

export default function SourceBadge({ source, sourceLabel, confidence }) {
  const getIcon = () => {
    switch (source) {
      case 'patient-voice':
      case 'patient-intake':
        return '🎤';
      case 'document-ocr':
        return '📄';
      case 'previous-record':
        return '🗂';
      case 'device-vitals':
        return '🩺';
      default:
        return '✨';
    }
  };

  const getSourceDisplay = () => {
    if (sourceLabel) return sourceLabel;
    switch (source) {
      case 'patient-voice':
        return 'Patient Voice Input';
      case 'patient-intake':
        return 'Patient reported';
      case 'document-ocr':
        return 'Document extracted';
      case 'previous-record':
        return 'Previous record';
      case 'device-vitals':
        return 'IoT Device Recorded';
      default:
        return 'AI Synthesized';
    }
  };

  const isHighConfidence = confidence && confidence.toLowerCase().includes('high');

  return (
    <div className="cr-source-badge-wrap">
      <span className={`cr-source-chip ${source || 'default'}`} title={`Source: ${getSourceDisplay()}`}>
        <span className="cr-source-icon" aria-hidden="true">{getIcon()}</span>
        <span className="cr-source-text">{getSourceDisplay()}</span>
      </span>

      {confidence && (
        <span
          className={`cr-confidence-chip ${isHighConfidence ? 'high' : 'medium'}`}
          title="Confidence score evaluated by CareVault Clinical NLP"
        >
          {confidence}
        </span>
      )}
    </div>
  );
}
