import { NoteProps } from "../components/note/NoteProps";
import { Task } from "../components/note/Task";
import { Timer } from "../service/useTimeManager";
import { isDateOlderThanCurrent } from "./utils";

// 1 -- incomplete task
// 2 -- reminders past due
// 3 -- browse all notes
// export const GetAllNotes = (displayType: number) => {
//   const storedState = localStorage.getItem("notes");
//   if (storedState) {
//     const parsedState: NoteProps[] = JSON.parse(storedState);
//     if (displayType === 3) {
//       return parsedState.map((note) => ({
//         id: note.id,
//         content: note.content,
//         title: note.title || "new note",
//       }));
//     } else if (displayType === 2) {
//       const reminders = localStorage.getItem("reminders");
//       if (reminders) {
//         const parsedReminders: Timer[] = JSON.parse(reminders);

//         const pastDueReminders = parsedReminders
//           .filter((obj) => isDateOlderThanCurrent(obj.reminderDate) === true)
//           .map((obj) => obj.noteId);

//         const pastDueNotes = parsedState.filter((obj) =>
//           pastDueReminders.includes(obj.id)
//         );

//         return pastDueNotes.map((note) => ({
//           id: note.id,
//           content: note.content,
//           title: note.title || "new note",
//         }));
//       }
//     } else if (displayType === 1) {
//       const tasks = localStorage.getItem("tasks");
//       if (tasks) {
//         const parsedTasks: Task[] = JSON.parse(tasks);
//         const pendingTasks = parsedTasks
//           .filter((obj) => obj.status.some((value) => value === 0))
//           .map((obj) => obj.noteId);

//         const pendingNotes = parsedState.filter((obj) =>
//           pendingTasks.includes(obj.id)
//         );

//         return pendingNotes.map((note) => ({
//           id: note.id,
//           content: note.content,
//           title: note.title || "new note",
//         }));
//       }
//     }
//   }
//   return [];
// };

export const GetAllNotes = (): {
  id: string;
  content: string;
  title: string;
  isImage: boolean;
}[][] => {
  const storedState = localStorage.getItem("notes");
  let allNotes: {
    id: string;
    content: string;
    title: string;
    isImage: boolean;
  }[] = [];
  let pastNotes: {
    id: string;
    content: string;
    title: string;
    isImage: boolean;
  }[] = [];
  let taskNotes: {
    id: string;
    content: string;
    title: string;
    isImage: boolean;
  }[] = [];
  if (storedState) {
    const parsedState: NoteProps[] = JSON.parse(storedState);

    allNotes = parsedState.map((note) => ({
      id: note.id,
      content: note.content,
      title: note.title || "new note",
      isImage: note.isImage,
    }));

    const reminders = localStorage.getItem("reminders");
    if (reminders) {
      const parsedReminders: Timer[] = JSON.parse(reminders);

      const pastDueReminders = parsedReminders
        .filter((obj) => isDateOlderThanCurrent(obj.reminderDate) === true)
        .map((obj) => obj.noteId);

      const pastDueNotes = parsedState.filter((obj) =>
        pastDueReminders.includes(obj.id)
      );

      pastNotes = pastDueNotes.map((note) => ({
        id: note.id,
        content: note.content,
        title: note.title || "new note",
        isImage: note.isImage,
      }));
    }

    const tasks = localStorage.getItem("tasks");
    if (tasks) {
      const parsedTasks: Task[] = JSON.parse(tasks);
      const pendingTasks = parsedTasks
        .filter((obj) => obj.status.some((value) => value === 0))
        .map((obj) => obj.noteId);

      const pendingNotes = parsedState.filter((obj) =>
        pendingTasks.includes(obj.id)
      );

      taskNotes = pendingNotes.map((note) => ({
        id: note.id,
        content: note.content,
        title: note.title || "new note",
        isImage: note.isImage,
      }));
    }
  }

  return [allNotes, pastNotes, taskNotes];
};
