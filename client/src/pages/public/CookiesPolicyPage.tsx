import React from 'react';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const CookiesPolicyPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="Cookie Policy" 
      lastUpdated="October 1, 2023"
      content={
        <>
          <p>We use essential cookies to keep you authenticated.</p>
          <h2>Strictly Necessary Cookies</h2>
          <p>These cookies are required for the platform to function. They include:</p>
          <ul>
            <li><strong>Authentication Token:</strong> Stored securely to identify your session.</li>
            <li><strong>Theme Preference:</strong> Stored to prevent layout flashing between Dark/Light modes.</li>
          </ul>
          <h2>Analytics Cookies</h2>
          <p>We collect anonymized telemetry on search queries to improve our ranking models.</p>
        </>
      }
    />
  );
};
