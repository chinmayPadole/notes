import React, { createContext, useContext, useState } from "react";
import { Toast, ToastProps } from "../components/toast/toast";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: JSX.Element) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (message: string, color = "#333", duration = 3000) => {
    setToast({ message, color });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} color={toast.color} />}
    </ToastContext.Provider>
  );
};
