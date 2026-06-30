import React from 'react';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="Privacy Policy" 
      lastUpdated="October 1, 2023"
      content={
        <>
          <p>This Privacy Policy describes how the Enterprise Knowledge Platform ("we", "us", or "our") collects, uses, and shares your personal data.</p>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, submit documents, or query the AI system. This may include:</p>
          <ul>
            <li>Name and email address</li>
            <li>Role-based Access Control (RBAC) definitions</li>
            <li>Uploaded documents and query history for telemetry optimization (if opted in)</li>
          </ul>
          <h2>2. How We Use Information</h2>
          <p>We use the information we collect to operate, maintain, and provide you with the features of the AI platform, as well as to communicate with you.</p>
          <h2>3. Data Security</h2>
          <p>Your data is processed using end-to-end encryption. All documents remain in your enterprise VPC boundaries.</p>
        </>
      }
    />
  );
};
