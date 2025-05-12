import React from 'react';
import { useOCPIRole } from '../contexts/OCPIRoleContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Zap } from 'lucide-react';

/**
 * OCPIRoleHeader - Displays the current active OCPI role (CPO/EMSP)
 * 
 * This component provides a visual indicator of which role the user is currently
 * operating in, helping to prevent confusion when switching between roles.
 */
export function OCPIRoleHeader() {
  const { role } = useOCPIRole();
  
  // If no role is selected, show a neutral header
  if (!role) {
    return (
      <Card className="mb-6 border-dashed border-2 border-yellow-300 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Badge variant="outline" className="text-yellow-800 bg-yellow-100 border-yellow-300 mr-2">
              No Role Selected
            </Badge>
            <span className="text-sm text-yellow-700">
              Please select an OCPI role (CPO or EMSP) to access OCPI features
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Determine styling based on role
  const isCPO = role === 'CPO';
  const bgColor = isCPO ? 'bg-blue-50' : 'bg-green-50';
  const borderColor = isCPO ? 'border-blue-300' : 'border-green-300';
  const textColor = isCPO ? 'text-blue-700' : 'text-green-700';
  const badgeBg = isCPO ? 'bg-blue-100' : 'bg-green-100';
  const badgeBorder = isCPO ? 'border-blue-300' : 'border-green-300';
  const badgeText = isCPO ? 'text-blue-800' : 'text-green-800';
  const Icon = isCPO ? Building2 : Zap;
  
  const roleDescription = isCPO 
    ? 'Charge Point Operator Mode - Manage your charging infrastructure'
    : 'E-Mobility Service Provider Mode - Manage EV driver services';
  
  return (
    <Card className={`mb-6 border-2 ${borderColor} ${bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <Icon className={`mr-2 h-5 w-5 ${textColor}`} />
          <Badge variant="outline" className={`${badgeText} ${badgeBg} ${badgeBorder} mr-2`}>
            {role} Role
          </Badge>
          <span className={`text-sm ${textColor}`}>{roleDescription}</span>
        </div>
      </CardContent>
    </Card>
  );
}
