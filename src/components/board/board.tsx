import React, { useState, useEffect, useRef } from "react";
import "./board.css";
import { Note } from "../note/note";
import { NoteProps } from "../note/NoteProps";
import { Wave } from "../voice/wave";
import { getUniqueId } from "../../common/utils";
import { Search } from "../search/search";
import { searchAndSort } from "../../common/search";
import { FloatingMenu } from "../floatingMenu/floatingMenu";
import { NewNoteEditor } from "../newNote/newNoteEditor";
import { usePeer } from "../../provider/PeerContext";
import { useToast } from "../../provider/toastProvider";
import { RequestNotificationPermission } from "../requestNotification/requestNotifications";

export const Board: React.FC<{
  isSearchMode: boolean;
  setSearchMode: (toggleSearchMode: boolean) => void;
}> = ({ isSearchMode, setSearchMode }) => {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isVoiceOn, setVoiceOn] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  const [currentNote, setCurrentNote] = useState<NoteProps | undefined>(
    undefined
  );

  const [noteEditorMode, setNoteEditorMode] = useState<
    "new" | "modify" | "null"
  >("null");
  const { isDataReceived, syncNotes } = usePeer();
  const { showToast } = useToast();

  const lastTap = useRef<number | null>(null);

  useEffect(() => {
    if (isDataReceived > 0) {
      refreshNotes();
      showToast("synced", "#30DB5B", 3000, "info");
    }
  }, [isDataReceived]);

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
        isImage: false,
        removeNote: removeNote,
        updateNote: updateNote,
        isNoteLocked: false,
        setNoteEditorMode: setNoteEditorMode,
        setCurrentNote: setCurrentNote,
      };
      addNote(newData);
    }
  }, [transcript]);

  // Load state from localStorage when the component mounts
  useEffect(() => {
    refreshNotes();
  }, []);

  const refreshNotes = () => {
    const storedState = localStorage.getItem("notes");
    if (storedState) {
      const parsedState: NoteProps[] = JSON.parse(storedState);
      setNotes(parsedState);
    }
  };

  const updateStateAndLocalStorage = (newData: NoteProps[]) => {
    setNotes(newData);
    localStorage.setItem("notes", JSON.stringify(newData));
    syncNotes();
  };

  const removeNote = (noteId: string) => {
    const newNoteData = notes.filter((data) => data.id !== noteId);
    updateStateAndLocalStorage(newNoteData);
    syncNotes();
  };

  const addNote = (noteData: NoteProps) => {
    const updatedData = [...notes, noteData];
    updateStateAndLocalStorage(updatedData);
    syncNotes();
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
          key={i}
          createDt={note.createDt}
          color={note.color}
          content={note.content}
          id={note.id}
          isImage={note.isImage}
          isNoteLocked={note.isNoteLocked}
          removeNote={removeNote}
          updateNote={updateNote}
          setNoteEditorMode={setNoteEditorMode}
          setCurrentNote={setCurrentNote}
        />
      );
    });
  };

  const handleTouch = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = 300;

    if (lastTap.current && currentTime - lastTap.current < tapLength) {
      setNoteEditorMode("new");
    } else {
      lastTap.current = currentTime;
    }
  };

  return (
    <>
      <div
        id="noteEditorDoubleClick"
        onDoubleClick={() => {
          setNoteEditorMode("new");
        }}
        onTouchEnd={handleTouch}
      ></div>
      <div id="boardBody">
        <div id="board-container">
          <div id="board">{getNotesElement()}</div>
        </div>
      </div>
      {!isSearchMode && (
        <>
          <NewNoteEditor
            addNote={addNote}
            updateNote={updateNote}
            removeNote={removeNote}
            noteEditorMode={noteEditorMode}
            setNoteEditorMode={setNoteEditorMode}
            setCurrentNote={setCurrentNote}
            noteId={currentNote !== undefined ? currentNote.id : undefined}
            isNoteLocked={
              currentNote !== undefined ? currentNote.isNoteLocked : undefined
            }
            currentContent={
              currentNote !== undefined ? currentNote.content : undefined
            }
          />
        </>
      )}
      {isSearchMode && (
        <Search
          visible={isSearchMode}
          onClose={setSearchMode}
          setSearchText={setSearchText}
        />
      )}

      <FloatingMenu
        setTranscript={setTranscript}
        setVoice={setVoiceOn}
        setNoteEditorMode={setNoteEditorMode}
      />
      <Wave showWave={isVoiceOn} />

      {Notification.permission !== "granted" && (
        <RequestNotificationPermission />
      )}
      {/* {transcript} */}
    </>
  );
};
