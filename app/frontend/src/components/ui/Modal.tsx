import { useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { Button } from './Button';

export function Modal() {
  const { modal, hideModal } = useUI();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        hideModal();
      }
    };
    
    if (modal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal, hideModal]);
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideModal();
      }
    };
    
    if (modal) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [modal, hideModal]);
  
  if (!modal) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">{modal.title}</h3>
          <button
            onClick={hideModal}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">{modal.content}</div>
        {(modal.onConfirm || modal.onCancel) && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            {modal.onCancel && (
              <Button
                variant="secondary"
                onClick={() => {
                  modal.onCancel?.();
                  hideModal();
                }}
              >
                {modal.cancelText || 'Cancel'}
              </Button>
            )}
            {modal.onConfirm && (
              <Button
                variant="primary"
                onClick={() => {
                  modal.onConfirm?.();
                  hideModal();
                }}
              >
                {modal.confirmText || 'Confirm'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
