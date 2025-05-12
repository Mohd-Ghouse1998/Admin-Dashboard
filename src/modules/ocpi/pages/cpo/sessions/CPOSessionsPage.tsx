import React from 'react';
import { useOCPIRole } from '../../../contexts/OCPIRoleContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { EnhancedCPOSessionsPage } from './EnhancedCPOSessionsPage';

/**
 * CPOSessionsPage - A wrapper around the enhanced version of the CPO sessions page.
 * This wrapper exists to maintain backward compatibility with existing routes.
 */
export const CPOSessionsPage: React.FC = () => {
  const { role } = useOCPIRole();

  // If not in CPO mode, show a message
  if (role !== 'CPO') {
    return (
      <PageLayout title="CPO Sessions" description="Session management is only available in CPO mode">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            CPO session management is only available in CPO mode. Please switch to CPO mode to access this feature.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  // If in CPO mode, show the enhanced page
  return <EnhancedCPOSessionsPage />;
};

export default CPOSessionsPage;
