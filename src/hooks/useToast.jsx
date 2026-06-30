import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, message, type = 'default', duration = 5000 }) => {
    const id = Date.now();
    const toast = { id, title, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (title, message, duration) => addToast({ title, message, type: 'success', duration });
  const error = (title, message, duration) => addToast({ title, message, type: 'error', duration });
  const info = (title, message, duration) => addToast({ title, message, type: 'info', duration });
  const warning = (title, message, duration) => addToast({ title, message, type: 'warning', duration });

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`min-w-[300px] max-w-md p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-900' :
            toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-900' :
            toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-900' :
            'bg-white border border-gray-200 text-gray-900'
          }`}
        >
          <div className="flex-1">
            <div className="font-semibold text-sm">{toast.title}</div>
            {toast.message && <div className="text-sm opacity-90 mt-1">{toast.message}</div>}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
