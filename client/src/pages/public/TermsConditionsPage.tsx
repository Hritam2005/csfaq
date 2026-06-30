import React from 'react';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const TermsConditionsPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="Terms & Conditions" 
      lastUpdated="October 1, 2023"
      content={
        <>
          <p>Welcome to the Enterprise Knowledge Hub. By accessing or using our platform, you agree to be bound by these Terms.</p>
          <h2>1. Acceptance of Terms</h2>
          <p>If you do not agree to all of the terms and conditions, you must not access the platform.</p>
          <h2>2. Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on the Platform for internal enterprise viewing only.</p>
          <h2>3. Acceptable Use Policy</h2>
          <p>You agree not to use the platform to generate illicit materials, attempt to bypass RBAC barriers, or overload the Embedding queues intentionally.</p>
        </>
      }
    />
  );
};
