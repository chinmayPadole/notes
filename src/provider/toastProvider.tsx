import React, { createContext, useContext, useState } from "react";
import { Toast, ToastProps } from "../components/toast/toast";
import { ToastType } from "../common/toastTypes";

const ToastContext = createContext({
  showToast: (message: string, color: string, duration: number, toastType: ToastType = "success") => { },
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: any) => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (message: string, color = "#333", duration = 3000, toastType: ToastType = "success") => {
    setToast({ message, color, toastType });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} color={toast.color} toastType={toast.toastType} />}
    </ToastContext.Provider>
  );
};
