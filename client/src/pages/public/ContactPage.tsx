import React from 'react';
import { LegalPageTemplate } from '../../components/layout/LegalPageTemplate';

export const ContactPage: React.FC = () => {
  return (
    <LegalPageTemplate 
      title="Contact Support" 
      lastUpdated="Always Available"
      content={
        <>
          <p>Need help with your Enterprise Knowledge deployment?</p>
          
          <div className="mt-8 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3>Email Support</h3>
            <p>For technical inquiries: <a href="mailto:support@enterprise.local">support@enterprise.local</a></p>
            <p>For billing: <a href="mailto:billing@enterprise.local">billing@enterprise.local</a></p>
          </div>
          
          <div className="mt-6 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
            <h3>Global Headquarters</h3>
            <p>123 Innovation Drive<br/>Tech District, San Francisco, CA 94105</p>
          </div>
        </>
      }
    />
  );
};
