import { useEffect } from 'react';
import { Toast as ToastType, useUI } from '../../context/UIContext';

// Toast props
interface ToastProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastProps) {
  const { removeToast } = useUI();
  
  // Auto-remove toast after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);
  
  // Toast variant styles
  const variantStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };
  
  // Toast icon
  const ToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };
  
  return (
    <div
      className={`${
        variantStyles[toast.type]
      } text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 mb-3 max-w-md w-full`}
    >
      <div className="flex-shrink-0">
        <ToastIcon />
      </div>
      <div className="flex-1">{toast.message}</div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-white focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
}

// Toast container
export function ToastContainer() {
  const { toasts } = useUI();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
