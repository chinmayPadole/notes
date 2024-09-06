import { createContext, useEffect } from "react";

import { getUniqueId } from "../common/utils";
import { Timer } from "../service/useTimeManager";

const CoreContext = createContext({});

export const CoreProvider = ({ children }: any) => {
  useEffect(() => {
    const app_id = localStorage.getItem("app_id");
    if (app_id === null || app_id === undefined || app_id.trim() === "") {
      localStorage.setItem("app_id", getUniqueId());
    }
  }, []);

  const GetReminders = () => {
    const storedState = localStorage.getItem("reminders");
    if (storedState) {
      const currentReminders: Timer[] = JSON.parse(storedState);

      const remindersToFire = currentReminders.filter(
        (x) => new Date(x.reminderDate).getTime() < new Date().getTime()
      );
      return remindersToFire;
    }
    return [];
  };

  const CleanupReminders = (reminders: Timer[]) => {
    const storedState = localStorage.getItem("reminders");
    if (storedState) {
      const currentReminders: Timer[] = JSON.parse(storedState);

      const result = currentReminders.filter(
        (a) => !reminders.some((b) => b.id === a.id)
      );

      localStorage.setItem("reminders", JSON.stringify(result));
    }
  };

  const FireScheduledReminders = () => {
    const reminders = GetReminders();

    if ("serviceWorker" in navigator && reminders.length > 0) {
      navigator.serviceWorker.ready.then((registration) => {
        // You can send a message to the service worker to trigger a notification

        reminders.forEach((reminder) => {
          registration.active?.postMessage({
            type: "TRIGGER_PUSH",
            title: "Super notes Reminder!",
            body: reminder.reminderText,
            image: reminder.reminderImage,
            reminderDate: reminder.reminderDate,
            noteId: reminder.noteId,
          });
        });

        CleanupReminders(reminders);
      });
    }
  };

  // useEffect(() => {
  //   // check & fire reminders immediately
  //   FireScheduledReminders();

  //   // Set up the interval to fetch data every minute
  //   const interval = setInterval(() => {
  //     FireScheduledReminders();
  //   }, 60000); // 60000 ms = 1 minute

  //   // Clean up the interval on component unmount
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []); // Empty dependency array ensures this runs once on mount and cleanup on unmount

  return <CoreContext.Provider value={{}}>{children}</CoreContext.Provider>;
};
