// useTimerManager.tsx
import { useState, useEffect } from "react";

interface Timer {
  id: number;
  delay: number;
  timeoutId: NodeJS.Timeout;
}

export const useTimerManager = () => {
  const [timers, setTimers] = useState<Timer[]>([]);

  const addTimer = (delay: number, reminderText: string) => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // You can send a message to the service worker to trigger a notification
        console.log("SENDING PUSH MESSAGE");
        registration.active?.postMessage({
          type: "TRIGGER_PUSH",
          title: "Super notes Reminder!",
          body: reminderText,
          delay: delay,
        });
      });
    }
  };

  //   const removeTimer = (id: number) => {
  //     setTimers((prevTimers) => prevTimers.filter((timer) => timer.id !== id));
  //   };

  //   const clearAllTimers = () => {
  //     timers.forEach((timer) => clearTimeout(timer.timeoutId));
  //     setTimers([]);
  //   };

  //  return { timers, addTimer, removeTimer, clearAllTimers };
  return { timers, addTimer };
};
