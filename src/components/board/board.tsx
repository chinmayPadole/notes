import React, { useState, useEffect } from "react";
import { Sidebar } from "../sidebar/sidebar";
import "./board.css";
import { Note, NoteProps } from "../note/note";
import { NewNoteDetector } from "../newNote/newNoteDetector";
import { Voice } from "../voice/voice";
import { Wave } from "../voice/wave";
import { getUniqueId } from "../../common/utils";

export const Board: React.FC = () => {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isVoiceOn, setVoiceOn] = useState<boolean>(false);

  useEffect(() => {
    if (
      transcript !== undefined &&
      transcript !== null &&
      transcript.trim() !== ""
    ) {
      const newData: NoteProps = {
        id: getUniqueId(),
        content: transcript,
        createDt: new Date(),
        color: "white",
        removeNote: removeNote,
        updateNote: updateNote,
        isNoteLocked: false,
      };
      addNote(newData);
    }
  }, [transcript]);

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
        {/* <div id="sidebar">
          <Sidebar />
        </div> */}
        <div id="board-container">
          <div id="board">{getNotesElement()}</div>
        </div>
      </div>
      <NewNoteDetector
        addNote={addNote}
        updateNote={updateNote}
        removeNote={removeNote}
      />

      <Voice setTranscript={setTranscript} setVoice={setVoiceOn} />
      <Wave showWave={isVoiceOn} />
      {/* {transcript} */}
    </>
  );
};
