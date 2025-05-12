
import React from "react";
import { Edit, Eye, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatDateTime, formatNumberWithUnit, formatCurrency, getStatusVariant } from "@/utils/formatters";
import { Column } from "@/components/ui/data-table";

/**
 * Reusable column definitions for data tables throughout the application
 */

// Basic columns
export const createIdColumn = <T extends Record<string, any>>(key: keyof T = 'id' as keyof T): Column<T> => ({
  header: 'ID',
  accessorKey: key as string,
  className: "w-[80px]",
});

export const createNameColumn = <T extends Record<string, any>>(key: keyof T = 'name' as keyof T): Column<T> => ({
  header: 'Name',
  accessorKey: key as string,
});

export const createDescriptionColumn = <T extends Record<string, any>>(key: keyof T = 'description' as keyof T): Column<T> => ({
  header: 'Description',
  accessorKey: key as string,
  enableTooltip: true,
});

// Date and time columns
export const createDateColumn = <T extends Record<string, any>>(
  key: keyof T,
  header: string = 'Date'
): Column<T> => ({
  header,
  accessorKey: key as string,
  cell: (item: T) => <span>{formatDate(item[key] as string)}</span>
});

export const createDateTimeColumn = <T extends Record<string, any>>(
  key: keyof T,
  header: string = 'Date & Time'
): Column<T> => ({
  header,
  accessorKey: key as string,
  cell: (item: T) => <span>{formatDateTime(item[key] as string)}</span>
});

// Numeric columns
export const createNumberColumn = <T extends Record<string, any>>(
  key: keyof T,
  header: string,
  unit: string = '',
  decimals: number = 2
): Column<T> => ({
  header,
  accessorKey: key as string,
  cell: (item: T) => <span>{formatNumberWithUnit(item[key] as number, unit, decimals)}</span>
});

export const createCurrencyColumn = <T extends Record<string, any>>(
  key: keyof T,
  header: string = 'Amount',
  currencyKey: keyof T = 'currency' as keyof T
): Column<T> => ({
  header,
  accessorKey: key as string,
  cell: (item: T) => <span>{formatCurrency(item[key] as number, (item[currencyKey] as string) || 'USD')}</span>
});

// Status column
export const createStatusColumn = <T extends Record<string, any>>(
  key: keyof T = 'status' as keyof T,
  statusMap?: Record<string, "success" | "warning" | "danger" | "info" | "neutral">
): Column<T> => ({
  header: 'Status',
  accessorKey: key as string,
  cell: (item: T) => {
    const status = String(item[key] || 'N/A');
    
    // Use custom status map or default logic
    const variant = statusMap && status in statusMap 
      ? statusMap[status]
      : getStatusVariant(status);
    
    return <StatusBadge status={status} variant={variant} />;
  }
});

// Action columns
interface ActionConfig<T> {
  icon: React.FC<{ className?: string }>;
  onClick: (item: T) => void;
  label: string;
  show?: (item: T) => boolean;
}

export const createActionsColumn = <T extends Record<string, any>>(
  actions: ActionConfig<T>[]
): Column<T> => ({
  header: 'Actions',
  accessorKey: 'id',
  className: "w-[100px]",
  cell: (item: T) => (
    <div className="flex space-x-2">
      {actions
        .filter(action => !action.show || action.show(item))
        .map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            onClick={() => action.onClick(item)}
            title={action.label}
          >
            <action.icon className="h-4 w-4" />
          </Button>
        ))}
    </div>
  ),
});

// Common action combinations
export const createViewEditActionsColumn = <T extends Record<string, any>>(
  onView: (item: T) => void,
  onEdit: (item: T) => void
): Column<T> => createActionsColumn<T>([
  { icon: Eye, onClick: onView, label: "View" },
  { icon: Edit, onClick: onEdit, label: "Edit" }
]);

export const createViewEditDeleteActionsColumn = <T extends Record<string, any>>(
  onView: (item: T) => void,
  onEdit: (item: T) => void,
  onDelete: (item: T) => void
): Column<T> => createActionsColumn<T>([
  { icon: Eye, onClick: onView, label: "View" },
  { icon: Edit, onClick: onEdit, label: "Edit" },
  { icon: Trash2, onClick: onDelete, label: "Delete" }
]);
