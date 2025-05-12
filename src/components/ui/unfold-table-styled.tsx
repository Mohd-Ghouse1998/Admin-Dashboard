import React from 'react';
import { cn } from '@/lib/utils';

interface UnfoldTableStyledProps {
  headers: string[];
  data: Record<string, any>[];
  keys: string[];
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

const UnfoldTableStyled = ({
  headers,
  data,
  keys,
  className,
  isLoading = false,
  emptyMessage = "No data found",
}: UnfoldTableStyledProps) => {
  return (
    <div className={cn(
      "border border-gray-200 rounded-md shadow-sm overflow-hidden dark:border-gray-800",
      className
    )}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-800">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-4 text-center">
                <div className="flex justify-center items-center space-x-2">
                  <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {keys.map((key, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm",
                      cellIndex === 0 ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export { UnfoldTableStyled };