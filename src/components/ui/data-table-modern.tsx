/**
 * @deprecated This component is deprecated. Please import DataTable directly.
 */

import { DataTable, Column } from './data-table';

// Re-export DataTable as DataTableModern for backward compatibility
export type { Column };

// The DataTableModern component is now just a wrapper around DataTable
export function DataTableModern<T extends Record<string, any>>(props: any) {
  return <DataTable {...props} />;
}

export default DataTableModern;
