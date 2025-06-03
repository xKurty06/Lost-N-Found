import React, { createContext, useContext, useState, ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative min-w-[220px] max-w-xs px-4 py-3 rounded-lg shadow-lg text-white animate-toast-in overflow-hidden
              ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"}
            `}
            style={{ animationDuration: '0.4s' }}
            role="status"
            aria-live="polite"
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="absolute top-1 right-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white rounded"
              aria-label="Dismiss notification"
              tabIndex={0}
              type="button"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <div className="absolute left-0 bottom-0 h-1 bg-white/60 animate-toast-bar" style={{ width: '100%' }} />
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateX(100px) scale(0.95); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-toast-in {
          animation: toast-in 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes toast-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-bar {
          animation: toast-bar 3.1s linear forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export default ToastProvider;