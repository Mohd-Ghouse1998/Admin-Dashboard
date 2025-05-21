import { ReactNode } from 'react';

// Base props that all entity templates share
export interface BaseEntityTemplateProps {
  title: string;
  description?: string;
  className?: string;
  isLoading?: boolean;
  error?: Error | null | string;
}

// Configuration for entity columns
export interface EntityColumnConfig<T> {
  key: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  width?: string;
  className?: string;
}

// Configuration for entity filters
export interface EntityFilterConfig {
  id: string;
  label: string;
  options: {
    label: string;
    value: string;
    icon?: ReactNode;
  }[];
}

// Configuration for entity actions
export interface EntityActionConfig {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  permission?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
