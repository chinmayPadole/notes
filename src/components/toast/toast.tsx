import React from "react";
import "./toast.css";

export interface ToastProps {
  message: string;
  color: string;
}

export const Toast: React.FC<ToastProps> = ({ message, color = "#333" }) => {
  return (
    <div className="toast" style={{ backgroundColor: color }}>
      <span>{message}</span>
    </div>
  );
};
