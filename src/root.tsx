import { useEffect } from "react";
import { Board } from "./components/board/board";
import { Settings } from "./components/settings/settings";
import "./root.css";

export const Root = () => {
  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }, []);

  return (
    <div className="root">
      <div className="settings">
        <Settings />
      </div>
      <div className="board">
        <Board />
      </div>
    </div>
  );
};
