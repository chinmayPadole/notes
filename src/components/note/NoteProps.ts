export interface NoteProps {
  id: string;
  createDt: Date;
  content: string;
  color: string;
  removeNote: (noteId: string) => void;
  updateNote: (
    noteId: string,
    newContent: string,
    newColor: string,
    isNoteLocked: boolean
  ) => void;
  isNoteLocked: boolean;
  toggleNoteUpdateMode: (isEditing: boolean) => void;
}
