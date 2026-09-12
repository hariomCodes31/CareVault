import { useState } from 'react';
import SourceBadge from './SourceBadge';

export default function SummarySection({
  sectionKey,
  section,
  onSaveEdit,
  isEditingGlobal,
}) {
  const [isLocalEditing, setIsLocalEditing] = useState(false);
  const [draftText, setDraftText] = useState(section.text || '');

  const isEditing = isEditingGlobal || isLocalEditing;

  const handleSave = () => {
    if (onSaveEdit) {
      onSaveEdit(sectionKey, draftText);
    }
    setIsLocalEditing(false);
  };

  const handleCancel = () => {
    setDraftText(section.text || '');
    setIsLocalEditing(false);
  };

  return (
    <div className={`cr-summary-section-box ${section.isComplete ? '' : 'incomplete'}`} id={`sec-${sectionKey}`}>
      <div className="cr-sec-header">
        <div className="cr-sec-title-group">
          <h3 className="cr-sec-title">{section.title}</h3>
          <SourceBadge
            source={section.source}
            sourceLabel={section.sourceLabel}
            confidence={section.confidence}
          />
        </div>

        <div className="cr-sec-actions">
          {!isEditing ? (
            <button
              type="button"
              className="cr-btn-inline-edit"
              onClick={() => {
                setDraftText(section.text || '');
                setIsLocalEditing(true);
              }}
              title="Edit AI-generated text"
            >
              ✎ Edit
            </button>
          ) : (
            <div className="cr-edit-actions">
              <button
                type="button"
                className="cr-btn-save-edit"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                type="button"
                className="cr-btn-cancel-edit"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="cr-sec-body">
        {isEditing ? (
          <textarea
            className="cr-sec-textarea"
            rows={Math.max(3, (draftText.split('\n').length || 1) + 1)}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder={`Enter clinical notes for ${section.title}...`}
          />
        ) : (
          <p className="cr-sec-text">
            {section.text || <em className="cr-muted-italic">No information recorded.</em>}
          </p>
        )}
      </div>
    </div>
  );
}
