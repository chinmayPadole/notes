import { useEffect } from "react";
import { Board } from "./components/board/board";
import { Settings } from "./components/settings/settings";
import "./root.css";

export const Root = () => {
  useEffect(() => {
    // Request notification permission on component mount
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
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
