import { PRIVACY_POLICY_INTRO, PRIVACY_POLICY_META, PRIVACY_POLICY_SECTIONS } from "../data/privacyPolicy";

function renderParagraph(text: string, key: number) {
  // Preserve the doc's line-break lists exactly.
  const lines = text.split("\n");
  if (lines.length === 1) return <p key={key} className="privacy-p">{text}</p>;
  return (
    <div key={key} className="privacy-list">
      {lines.map((line, i) => (
        <p key={i} className="privacy-p privacy-list-line">{line}</p>
      ))}
    </div>
  );
}

export function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Privacy Policy">
      <div className="privacy-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close privacy policy">
          ✕
        </button>
        <h2>{PRIVACY_POLICY_META.title}</h2>
        <p className="muted small">
          {PRIVACY_POLICY_META.application} · {PRIVACY_POLICY_META.publisher} · Effective:{" "}
          {PRIVACY_POLICY_META.effectiveDate}
        </p>
        <div className="privacy-body">
          {PRIVACY_POLICY_INTRO.map((p, i) => renderParagraph(p, i))}
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <section key={section.heading} className="privacy-section">
              <h3 className="privacy-h">{section.heading}</h3>
              {section.body.map((p, i) => renderParagraph(p, i))}
            </section>
          ))}
        </div>
        <button className="btn-primary big" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
