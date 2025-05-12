import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileDown, 
  FileText,
  File,
  Loader2
} from 'lucide-react';
// Import OCPISession from our existing ocpi.types file
import { OCPISession } from '@/modules/ocpi/types/ocpi.types';
import { format } from 'date-fns';

interface SessionExportProps {
  data: OCPISession[];
  fileName?: string;
}

const SessionExport: React.FC<SessionExportProps> = ({ 
  data, 
  fileName = 'ocpi-sessions-export'
}) => {
  // Ensure data is an array even if undefined is passed
  const sessions = Array.isArray(data) ? data : [];
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Generate timestamped filename
  const getFileName = (extension: string) => {
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    return `${fileName}-${timestamp}.${extension}`;
  };
  
  // Convert sessions to CSV format
  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Define CSV headers
      const headers = [
        'Session ID',
        'Status',
        'Start Time',
        'End Time',
        'Auth ID',
        'Auth Method',
        'Location',
        'EVSE UID',
        'Connector ID',
        'kWh',
        'Currency'
      ];
      
      // Map session data to CSV rows
      const rows = sessions.map(session => [
        session.session_id || '',
        session.status || '',
        session.start_datetime || '',
        session.end_datetime || '',
        session.auth_id || '',
        session.auth_method || '',
        // Handle location as a numeric ID
        session.location ? `Location ID: ${session.location}` : '',
        // Handle evse as a numeric ID
        session.evse ? `EVSE ID: ${session.evse}` : '',
        // Handle connector as a numeric ID
        session.connector ? `Connector ID: ${session.connector}` : '',
        session.kwh?.toString() || '0',
        session.currency || ''
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', getFileName('csv'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Convert sessions to JSON format
  const exportToJSON = () => {
    setIsExporting(true);
    
    try {
      // Create a clean version of the sessions data
      const cleanedData = sessions.map(session => ({
        session_id: session.session_id,
        status: session.status,
        start_datetime: session.start_datetime,
        end_datetime: session.end_datetime,
        auth_id: session.auth_id,
        auth_method: session.auth_method,
        location: session.location, // Preserve as numeric ID
        evse: session.evse, // Preserve as numeric ID
        connector: session.connector, // Preserve as numeric ID
        kwh: session.kwh,
        currency: session.currency,
        last_updated: session.last_updated
      }));
      
      const jsonContent = JSON.stringify({ sessions: cleanedData }, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', getFileName('json'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to JSON:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || sessions.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON} className="cursor-pointer">
          <File className="mr-2 h-4 w-4" />
          Export to JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SessionExport;
