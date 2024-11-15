"use client";

import { cn } from "@/lib/utils/styles";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastNotificationProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

function ToastNotification({
  message,
  type,
  onDismiss,
}: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: AlertCircle,
  }[type];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-slide-in-right",
        {
          "bg-red-50 text-red-900": type === "error",
          "bg-green-50 text-green-900": type === "success",
          "bg-blue-50 text-blue-900": type === "info",
        }
      )}
    >
      <Icon
        className={cn("w-5 h-5", {
          "text-red-500": type === "error",
          "text-green-500": type === "success",
          "text-blue-500": type === "info",
        })}
      />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-500">
        <XCircle className="w-5 h-5" />
      </button>
    </div>
  );
}

export default ToastProvider;
