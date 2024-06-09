import nlp from "compromise";
import datePlugin from "compromise-dates";
nlp.plugin(datePlugin);

export const isReminderPossible = (inputText: string): string | null => {
  const doc = nlp(inputText) as any;
  const task = doc.sentences().out("text");
  const timeText = doc.dates().out("text");
  const time = doc.dates().get()[0];

  if (task && time) {
    // Calculate the time interval in milliseconds
    const now = new Date().getTime();
    const reminderTime = new Date(time.start).getTime();
    const timeInterval = reminderTime - now;

    if (timeInterval > 0) {
      return timeText;
    }
  }
  return null;
};

export const getReminderTime = (inputText: string): {reminderTime: number, reminderText: string} | undefined => {
  // Parse the input text using compromise
  const doc = nlp(inputText) as any;
  const task = doc.sentences().out("text");
  const time = doc.dates().get()[0];

  if (task && time) {
    // Calculate the time interval in milliseconds
    const now = new Date().getTime();
    const reminderTime = new Date(time.start).getTime();
    const timeInterval = reminderTime - now;

    console.log(timeInterval, time.start, reminderTime);

    if (timeInterval > 0) {
      // Set a reminder
      // setTimeout(() => {
      //   if (Notification.permission === "granted") {
      //     new Notification("Reminder", {
      //       body: task,
      //     });
      //   } else {
      //     alert(`Reminder: ${task}`);
      //   }
      // }, timeInterval);

      return {reminderTime: timeInterval, reminderText: task};
    }
  }
};
