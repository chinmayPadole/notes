import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Root } from "./root";
import { ToastProvider } from "./provider/toastProvider";
import { SecurityProvider } from "./provider/securityProvider";

declare global {
  interface Window {
    localStream: any;
    localAudio: any;
  }
}
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <SecurityProvider>
      <ToastProvider>
        <Root />
      </ToastProvider>
    </SecurityProvider>
  </React.StrictMode>
);

// serviceWorker.register();
