export interface NoteProps {
  id: string;
  createDt: Date;
  content: string;
  color: string;
  isImage: boolean;
  removeNote: (noteId: string) => void;
  updateNote: (
    noteId: string,
    newContent: string,
    newColor: string,
    isNoteLocked: boolean
  ) => void;
  isNoteLocked: boolean;
  setNoteEditorMode: (mode: "new" | "modify" | "null") => void;
  setCurrentNote: (note: NoteProps | undefined) => void;
}
