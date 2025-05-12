
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OcpiParty } from '../hooks/useOcpiParties';

interface PartyCardProps {
  party: OcpiParty;
}

export const PartyCard: React.FC<PartyCardProps> = ({ party }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{party.name}</CardTitle>
          <Badge className={getStatusColor(party.status)} variant="outline">
            {party.status || 'UNKNOWN'}
          </Badge>
        </div>
        <CardDescription>Party ID: {party.party_id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Country Code</p>
            <p>{party.country_code}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p>{party.role}</p>
          </div>
          {party.created_at && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p>{new Date(party.created_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
