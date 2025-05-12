import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import TokenValidatorEnhanced from './TokenValidatorEnhanced';

const EnhancedTokenValidatorPage: React.FC = () => {
  return (
    <PageLayout 
      title="OCPI Token Validator" 
      description="Validate tokens for charging authorization"
      backButton={true}
      backTo="/ocpi/cpo/tokens"
    >
      <TokenValidatorEnhanced />
    </PageLayout>
  );
};

export default EnhancedTokenValidatorPage;
