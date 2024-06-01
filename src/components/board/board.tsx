import React, { useState, useEffect } from "react";
import { Sidebar } from "../sidebar/sidebar";
import "./board.css";
import { Note, NoteProps } from "../note/note";
import { NewNoteDetector } from "../newNote/newNoteDetector";

export const Board = () => {
  const [notes, setNotes] = useState<NoteProps[]>([]);

  // Load state from localStorage when the component mounts
  useEffect(() => {
    const storedState = localStorage.getItem("notes");
    if (storedState) {
      const parsedState: NoteProps[] = JSON.parse(storedState);
      setNotes(parsedState);
    }
  }, []);

  const updateStateAndLocalStorage = (newData: NoteProps[]) => {
    setNotes(newData);
    localStorage.setItem("notes", JSON.stringify(newData));
  };

  const removeNote = (noteId: string) => {
    const newNoteData = notes.filter((data) => data.id !== noteId);
    updateStateAndLocalStorage(newNoteData);
  };

  const addNote = (noteData: NoteProps) => {
    const updatedData = [...notes, noteData];
    updateStateAndLocalStorage(updatedData);
  };

  const updateNote = (
    noteId: string,
    updatedContent: string,
    updatedColor: string,
    isNoteLocked: boolean
  ) => {
    const updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        return {
          ...note,
          content: updatedContent,
          color: updatedColor,
          isNoteLocked: isNoteLocked,
        };
      }
      return note;
    });
    updateStateAndLocalStorage(updatedNotes);
  };

  const getNotesElement = () => {
    return notes.map((note, i) => {
      return (
        <Note
          createDt={note.createDt}
          color={note.color}
          content={note.content}
          id={note.id}
          isNoteLocked={note.isNoteLocked}
          removeNote={removeNote}
          updateNote={updateNote}
        />
      );
    });
  };

  return (
    <>
      <div id="boardBody">
        <div id="sidebar">
          <Sidebar />
        </div>
        <div id="board">{getNotesElement()}</div>
      </div>
      <NewNoteDetector
        addNote={addNote}
        updateNote={updateNote}
        removeNote={removeNote}
      />
    </>
  );
};
