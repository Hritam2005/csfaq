import React from 'react';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const AccessibilityPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="Accessibility Statement" 
      lastUpdated="October 1, 2023"
      content={
        <>
          <p>We are committed to ensuring digital accessibility for people with disabilities.</p>
          <h2>Conformance Status</h2>
          <p>The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. We are partially conformant with WCAG 2.1 level AA.</p>
          <h2>Feedback</h2>
          <p>We welcome your feedback on the accessibility of the Enterprise Knowledge Hub. Please let us know if you encounter accessibility barriers via our Contact page.</p>
        </>
      }
    />
  );
};
