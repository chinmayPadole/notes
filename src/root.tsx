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

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          const keepAlive = () => {
            if (registration.active) {
              registration.active.postMessage("keep-alive");
            }
          };
          keepAlive();
          setInterval(keepAlive, 10000); // Send a message every 10 seconds
        }
      });
    }

    // return () => {
    //   navigator.serviceWorker.getRegistrations().then((registrations) => {
    //     registrations.forEach((registration) => {
    //       registration.unregister();
    //       console.log("UNREGISTER");
    //     });
    //   });
    // };
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
