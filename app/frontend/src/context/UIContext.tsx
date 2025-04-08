import { createContext, useContext, useState, ReactNode } from 'react';

// Toast type
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Modal type
export interface Modal {
  id: string;
  title: string;
  content: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

// Context type
interface UIContextType {
  toasts: Toast[];
  modal: Modal | null;
  showToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  showModal: (modal: Omit<Modal, 'id'>) => void;
  hideModal: () => void;
}

// Create context
const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider props
interface UIProviderProps {
  children: ReactNode;
}

// UI provider component
export function UIProvider({ children }: UIProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<Modal | null>(null);

  // Show toast
  const showToast = (message: string, type: Toast['type']) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  // Remove toast
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Show modal
  const showModal = (modalData: Omit<Modal, 'id'>) => {
    const id = Date.now().toString();
    setModal({ ...modalData, id });
  };

  // Hide modal
  const hideModal = () => {
    setModal(null);
  };

  // Context value
  const value = {
    toasts,
    modal,
    showToast,
    removeToast,
    showModal,
    hideModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// Custom hook to use UI context
export function useUI() {
  const context = useContext(UIContext);
  
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
}
