import React from 'react';
import { useOCPIRole } from '../contexts/OCPIRoleContext';
import { Button } from '@/components/ui/button';
import { SwitchCamera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Component that adds OCPI actions to the application header
 * Displays the current role and provides a quick link to the role switcher
 */
export const OCPIHeaderActions: React.FC = () => {
  const { role } = useOCPIRole();
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Navigate to the correct path defined in the routes
    navigate('/ocpi/select-role');
  };
  
  return (
    <div className="flex items-center mr-4">
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2" 
        onClick={handleClick}
      >
        <SwitchCamera className="h-4 w-4" />
        <span className="hidden md:inline">{role} Mode</span>
        <span className="md:hidden">OCPI</span>
      </Button>
    </div>
  );
};
