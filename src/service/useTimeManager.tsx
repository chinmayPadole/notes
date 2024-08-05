import { getUniqueId } from "../common/utils";

// useTimerManager.tsx
export interface Timer {
  reminderText: string;
  delay: number;
  reminderDate: Date;
  reminderImage: string | null;
  id: string;
  noteId: string;
}

export const getReminders = (): Timer[] => {
  const storedState = localStorage.getItem("reminders");
  if (storedState) {
    let parsedState: Timer[] = JSON.parse(storedState);
    //parsedState = cleanupPastReminders(parsedState);
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
    (x) =>
      new Date(x.reminderDate).getTime() > new Date().getTime() - 2 * 60 * 1000 // 2 minutes buffer
  );
  reminders.push(timer);
  localStorage.setItem("reminders", JSON.stringify(reminders));
};

export const useTimerManager = () => {
  const addTimer = (
    delay: number,
    reminderText: string,
    reminderImage: string | null,
    noteId: string
  ) => {
    storeReminder({
      reminderText: reminderText,
      delay: delay,
      reminderDate: new Date(new Date().getTime() + delay),
      id: getUniqueId(),
      reminderImage: reminderImage,
      noteId: noteId,
    });
  };

  return { addTimer };
};
