import SummarySection from './SummarySection';

export default function ClinicalSummary({
  summarySections,
  onSaveSection,
  isEditingGlobal,
}) {
  const sectionsList = [
    { key: 'chiefComplaint', ...summarySections.chiefComplaint },
    { key: 'historyOfPresentIllness', ...summarySections.historyOfPresentIllness },
    { key: 'pastMedicalHistory', ...summarySections.pastMedicalHistory },
    { key: 'pastSurgicalHistory', ...summarySections.pastSurgicalHistory },
    { key: 'drugHistory', ...summarySections.drugHistory },
    { key: 'allergyHistory', ...summarySections.allergyHistory },
    { key: 'familyHistory', ...summarySections.familyHistory },
    { key: 'personalSocialHistory', ...summarySections.personalSocialHistory },
    { key: 'reviewOfSystems', ...summarySections.reviewOfSystems },
    { key: 'vitals', ...summarySections.vitals },
    { key: 'previousInvestigations', ...summarySections.previousInvestigations },
    { key: 'currentSymptoms', ...summarySections.currentSymptoms },
    { key: 'relevantPreviousHistory', ...summarySections.relevantPreviousHistory },
  ];

  return (
    <div className="cr-clinical-summary-card" id="clinical-summary-section">
      <div className="cr-summary-top-bar">
        <div className="cr-summary-title-group">
          <div className="cr-section-eyebrow">Structured Clinical Documentation</div>
          <h2 className="cr-card-heading">AI-Assisted Clinical Summary</h2>
          <p className="cr-card-desc">
            Structured physician-readable synthesis generated from patient input, previous records, and digitized lab reports.
          </p>
        </div>

        <div className="cr-safety-disclaimer-pill" title="Clinical AI Safety Protocol">
          <span>ℹ Non-final clinical draft · Requires physician verification</span>
        </div>
      </div>

      {/* Grid of 13 Clinical Sections */}
      <div className="cr-summary-sections-grid">
        {sectionsList.map((sec) => (
          <SummarySection
            key={sec.key}
            sectionKey={sec.key}
            section={sec}
            onSaveEdit={onSaveSection}
            isEditingGlobal={isEditingGlobal}
          />
        ))}
      </div>
    </div>
  );
}
