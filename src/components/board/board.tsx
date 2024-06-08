import React, { useState, useEffect } from "react";
import "./board.css";
import { Note } from "../note/note";
import { NoteProps } from "../note/NoteProps";
import { NewNoteDetector } from "../newNote/newNoteDetector";
import { Voice } from "../voice/voice";
import { Wave } from "../voice/wave";
import { getUniqueId } from "../../common/utils";
import { Search } from "../search/search";
import { searchAndSort } from "../../common/search";
import { FloatingMenu } from "../floatingMenu/floatingMenu";
import { NewNoteEditor } from "../newNote/newNoteEditor";

export const Board: React.FC = () => {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isVoiceOn, setVoiceOn] = useState<boolean>(false);
  const [isSearchMode, setSearchMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [isNoteUpdating, toggleNoteEditorMode] = useState(false);

  const [istNoteEditorOpen, openNoteEditor] = useState(Boolean);

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
        toggleNoteUpdateMode: toggleNoteEditorMode,
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
    let source = [...notes];

    source = source.sort(
      (a, b) => new Date(b.createDt).getTime() - new Date(a.createDt).getTime()
    );

    if (isSearchMode) {
      source = searchAndSort(source, searchText);
    }

    return source.map((note, i) => {
      return (
        <Note
          createDt={note.createDt}
          color={note.color}
          content={note.content}
          id={note.id}
          isNoteLocked={note.isNoteLocked}
          removeNote={removeNote}
          updateNote={updateNote}
          toggleNoteUpdateMode={toggleNoteEditorMode}
        />
      );
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchMode(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div id="boardBody">
        <div id="board-container">
          <div id="board">{getNotesElement()}</div>
        </div>
      </div>
      {!isSearchMode && !isNoteUpdating && (
        <>
          {/* <NewNoteDetector
            addNote={addNote}
            updateNote={updateNote}
            removeNote={removeNote}
            openNoteEditor={istNoteEditorOpen}
            toggleNoteEditorMode={toggleNoteEditorMode}
          /> */}

          <NewNoteEditor
            addNote={addNote}
            updateNote={updateNote}
            removeNote={removeNote}
            openNoteEditor={istNoteEditorOpen}
            toggleNoteEditorMode={toggleNoteEditorMode}
          />

          {/* <Voice setTranscript={setTranscript} setVoice={setVoiceOn} /> */}
          <FloatingMenu
            setTranscript={setTranscript}
            setVoice={setVoiceOn}
            setNoteEditorOpen={openNoteEditor}
          />
          <Wave showWave={isVoiceOn} />
        </>
      )}
      {isSearchMode && (
        <Search
          visible={isSearchMode}
          onClose={setSearchMode}
          setSearchText={setSearchText}
        />
      )}
      {/* {transcript} */}
    </>
  );
};
