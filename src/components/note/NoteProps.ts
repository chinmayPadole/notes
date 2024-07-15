export interface NoteProps {
  id: string;
  createDt: Date;
  content: string;
  color: string;
  isImage: boolean;
  title: string | null;
  removeNote: (noteId: string) => void;
  updateNote: (
    noteId: string,
    newContent: string,
    newColor: string,
    isNoteLocked: boolean,
    title: string | null
  ) => void;
  isNoteLocked: boolean;
  setNoteEditorMode: (mode: "new" | "modify" | "null") => void;
  setCurrentNote: (note: NoteProps | undefined) => void;
  preventNewNoteDetection: (isNewNoteDetectionEnabled: boolean) => void;
  isHighlighted: boolean;
}
