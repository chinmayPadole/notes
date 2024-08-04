import { NoteProps } from "../components/note/NoteProps";

export const GetAllNotes = () => {
  const storedState = localStorage.getItem("notes");
  if (storedState) {
    const parsedState: NoteProps[] = JSON.parse(storedState);
    return parsedState.map((note) => ({
      id: note.id,
      content: note.content,
      title: note.title || "new note",
    }));
  }
  return [];
};
