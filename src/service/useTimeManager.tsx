// useTimerManager.tsx
interface Timer {
  reminderText: string;
  delay: number;
  reminderDate: Date;
}

export const getReminders = (): Timer[] => {
  const storedState = localStorage.getItem("reminders");
  if (storedState) {
    let parsedState: Timer[] = JSON.parse(storedState);
    parsedState = cleanupPastReminders(parsedState);
    return parsedState;
  }
  return [];
};

const cleanupPastReminders = (reminders: Timer[]) => {
  reminders = reminders.filter(
    (x) => new Date(x.reminderDate).getTime() > new Date().getTime()
  );

  localStorage.setItem("reminders", JSON.stringify(reminders));
  return reminders;
};

export const storeReminder = (timer: Timer) => {
  var reminders = getReminders() ?? [];
  reminders = reminders.filter(
    (x) => new Date(x.reminderDate).getTime() > new Date().getTime()
  );
  reminders.push(timer);
  localStorage.setItem("reminders", JSON.stringify(reminders));
};

export const useTimerManager = () => {
  const addTimer = (delay: number, reminderText: string) => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        storeReminder({
          reminderText: reminderText,
          delay: delay,
          reminderDate: new Date(new Date().getTime() + delay),
        });
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
  return { addTimer };
};
