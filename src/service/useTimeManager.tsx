import { getUniqueId } from "../common/utils";
import { addData, getStoreData, initDB, Stores } from "../db/IndexedDBManager";

// useTimerManager.tsx
export interface Timer {
  reminderText: string;
  delay: number;
  reminderDate: Date;
  reminderImage: string | null;
  id: string;
  noteId: string;
}

export const getReminders = async (): Promise<Timer[]> => {
  const storedState = await getStoreData<Timer>(Stores.Reminders);
  if (storedState) {
    return storedState;
  }
  return [];
};

// const cleanupPastReminders = (reminders: Timer[]) => {
//   reminders = reminders.filter(
//     (x) => new Date(x.reminderDate).getTime() > new Date().getTime()
//   );

//   localStorage.setItem("reminders", JSON.stringify(reminders));
//   return reminders;
// };

export const storeReminder = async (timer: Timer) => {
  await initDB();

  // var reminders = (await getReminders()) ?? [];
  // reminders = reminders.filter(
  //   (x) =>
  //     new Date(x.reminderDate).getTime() > new Date().getTime() - 2 * 60 * 1000 // 2 minutes buffer
  // );
  // reminders.push(timer);
  await addData(Stores.Reminders, timer);
};

export const useTimerManager = () => {
  const addTimer = async (
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
