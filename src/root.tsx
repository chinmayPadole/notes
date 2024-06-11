import { useEffect } from "react";
import { Board } from "./components/board/board";
import "./root.css";
import * as serviceWorker from "./serviceWorker";
import { SuperNotes } from "./components/superNotes/superNotes";

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

  useEffect(() => {
    serviceWorker.register({
      onUpdate: (registration) => {
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      },
    });
  }, []);

  return (
    // <div className="root">
    //   <div className="header">
    //     <span>Hello, Chinmay How can I help you today?</span>
    //   </div>
    //   <div className="board">
    //     <Board />
    //   </div>
    // </div>

    <SuperNotes />
  );
};
