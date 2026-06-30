import React from 'react';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const AboutPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="About Us" 
      lastUpdated="January 1, 2024"
      content={
        <>
          <p className="text-lg">We are building the intelligent backbone for modern enterprises.</p>
          <h2>Our Mission</h2>
          <p>Our mission is to eliminate knowledge silos by seamlessly bridging unstructured documents with cutting-edge AI orchestration.</p>
          <h2>The Technology</h2>
          <p>We leverage semantic embeddings, hybrid keyword search, and secure LLM generation to ensure that you get exact answers without hallucinations, completely secured behind enterprise-grade Role Based Access Control.</p>
        </>
      }
    />
  );
};
