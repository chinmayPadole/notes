import React, { useState, useEffect } from "react";
import { Sidebar } from "../sidebar/sidebar";
import "./board.css";
import { Note, NoteProps } from "../note/note";
import { getUniqueId } from "../../common/utils";

export const Board = () => {
  const [notes, setNotes] = useState<NoteProps[]>([]);

  // Load state from localStorage when the component mounts
  useEffect(() => {
    const storedState = localStorage.getItem("notes");
    console.log(storedState);
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

  const addNote = () => {
    const newData: NoteProps = {
      id: getUniqueId(),
      content: "test Content",
      createDt: new Date(),
      color: "white",
      removeNote: removeNote,
    };
    const updatedData = [...notes, newData];
    updateStateAndLocalStorage(updatedData);
  };

  const getNotesElement = () => {
    return notes.map((note, i) => {
      return (
        <Note
          createDt={note.createDt}
          color={note.color}
          content={note.content}
          id={note.id}
          removeNote={removeNote}
        />
      );
    });
  };

  return (
    <div id="boardBody">
      <div id="sidebar">
        <Sidebar />
      </div>
      <div id="board">{getNotesElement()}</div>
      <button className="addNote" onClick={addNote}>
        Add Note
      </button>
    </div>
  );
};
