import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: number) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">
        {toast.type === "success" ? (
          <CheckCircle size={18} />
        ) : (
          <XCircle size={18} />
        )}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={() => onClose(toast.id)}>
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: number) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook
let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = (message: string, type: ToastType = "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const close = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string) => show(message, "success");
  const error = (message: string) => show(message, "error");

  return { toasts, close, success, error };
}
