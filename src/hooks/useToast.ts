
import { useState, useEffect, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title?: string;
  description?: ReactNode;
  variant?: ToastType;
  action?: ReactNode;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = 'info',
    action,
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, action }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
    
    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toast,
    toasts,
    dismiss,
  };
}

// Export a singleton instance for global use
export const toast = {
  success: (title: string, description?: ReactNode) => {
    // Implementation would be added in a full implementation
    console.log('Toast success:', title, description);
  },
  error: (title: string, description?: ReactNode) => {
    // Implementation would be added in a full implementation
    console.log('Toast error:', title, description);
  },
  warning: (title: string, description?: ReactNode) => {
    // Implementation would be added in a full implementation
    console.log('Toast warning:', title, description);
  },
  info: (title: string, description?: ReactNode) => {
    // Implementation would be added in a full implementation
    console.log('Toast info:', title, description);
  },
};
