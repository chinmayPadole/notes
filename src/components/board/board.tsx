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
import { Dropdown } from "../dropdown/dropdown";

export const Board: React.FC<{
  isSearchMode: boolean;
  setSearchMode: (toggleSearchMode: boolean) => void;
  highlightNote: string | null;
}> = ({ isSearchMode, setSearchMode, highlightNote }) => {
  const [notes, setNotes] = useState<NoteProps[]>([]);
  const [transcript, setTranscript] = useState<string>("");
  const [isVoiceOn, setVoiceOn] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [isNewNoteDetectionDisabled, preventNewNoteDetection] =
    useState<boolean>(false);

  const [highlightedNote, setHighlightedNote] = useState<string | null>(null);

  const [currentNote, setCurrentNote] = useState<NoteProps | undefined>(
    undefined
  );

  const sortOptions: string[] = ["Newest", "Oldest"];
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(
    sortOptions[0]
  );

  const [noteElements, setNoteElements] = useState<JSX.Element[] | null>(null);

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
    if (notes !== null && notes.length > 0) {
      setNoteElements(getNotesElement());
    }
  }, [notes, isSearchMode, searchText, selectedSortOption]);

  useEffect(() => {
    if (
      transcript !== undefined &&
      transcript !== null &&
      transcript.trim() !== "" &&
      !isVoiceOn
    ) {
      const newData: NoteProps = {
        id: getUniqueId(),
        content: transcript,
        createDt: new Date(),
        color: "white",
        isImage: false,
        title: null,
        removeNote: removeNote,
        updateNote: updateNote,
        isNoteLocked: false,
        setNoteEditorMode: setNoteEditorMode,
        setCurrentNote: setCurrentNote,
        preventNewNoteDetection: preventNewNoteDetection,
        isHighlighted: false,
        isCheckList: false,
        pinDate: null,
      };
      addNote(newData);
      setTranscript("");
    }
  }, [transcript, isVoiceOn]);

  // Load state from localStorage when the component mounts
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paramValue = urlParams.get("noteId");
    if (paramValue) {
      setHighlightedNote(paramValue);
    }
    refreshNotes();
  }, []);

  useEffect(() => {
    if (highlightNote !== null) {
      setHighlightedNote(highlightNote);
      refreshNotes();
    }
  }, [highlightNote]);

  useEffect(() => {
    const clearQueryParam = () => {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("noteId");
      window.history.pushState({}, document.title, window.location.pathname);
    };

    // Delay execution by 5 seconds
    const timeoutId = setTimeout(() => {
      clearQueryParam();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function to clear the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, [highlightedNote]);

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
    isNoteLocked: boolean,
    title: string | null,
    isCheckList: boolean,
    pinDate: Date | null
  ) => {
    let isSilentUpdate: boolean = false;
    const updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        if (pinDate !== note.pinDate || isCheckList !== note.isCheckList) {
          isSilentUpdate = true;
        }
        return {
          ...note,
          content: updatedContent,
          color: updatedColor,
          isNoteLocked: isNoteLocked,
          title: title,
          isCheckList: isCheckList,
          pinDate: pinDate,
        };
      }
      return note;
    });
    updateStateAndLocalStorage(updatedNotes);
  };

  const getNotesElement = () => {
    let source = [...notes];

    // source = source.sort(
    //   (a, b) => new Date(b.createDt).getTime() - new Date(a.createDt).getTime()
    // );

    // source = source.sort((a, b) => {
    //   if (a.pinDate && b.pinDate) {
    //     // Both have pinDate, sort by pinDate in descending order
    //     return new Date(b.pinDate).getTime() - new Date(a.pinDate).getTime();
    //   } else if (a.pinDate) {
    //     // Only a has pinDate, a comes first
    //     return -1;
    //   } else if (b.pinDate) {
    //     // Only b has pinDate, b comes first
    //     return 1;
    //   } else {
    //     // Neither has pinDate, sort by createDate in descending order
    //     return new Date(b.createDt).getTime() - new Date(a.createDt).getTime();
    //   }
    // });

    source = source.sort((a, b) => {
      const orderMultiplier = selectedSortOption === "Oldest" ? 1 : -1;

      if (a.pinDate && b.pinDate) {
        // Both have pinDate, sort by pinDate in the specified order
        return (
          orderMultiplier *
          (new Date(a.pinDate).getTime() - new Date(b.pinDate).getTime())
        );
      } else if (a.pinDate) {
        // Only a has pinDate, a comes first
        return -1;
      } else if (b.pinDate) {
        // Only b has pinDate, b comes first
        return 1;
      } else {
        // Neither has pinDate, sort by createDate in the specified order
        return (
          orderMultiplier *
          (new Date(a.createDt).getTime() - new Date(b.createDt).getTime())
        );
      }
    });

    if (isSearchMode) {
      source = searchAndSort(source, searchText);
    }

    return source.map((note, i) => {
      return (
        <Note
          key={note.id}
          createDt={note.createDt}
          color={note.color}
          content={note.content}
          id={note.id}
          isImage={note.isImage}
          isNoteLocked={note.isNoteLocked}
          title={note.title}
          removeNote={removeNote}
          updateNote={updateNote}
          setNoteEditorMode={setNoteEditorMode}
          setCurrentNote={setCurrentNote}
          preventNewNoteDetection={preventNewNoteDetection}
          isHighlighted={note.id === highlightedNote}
          isCheckList={note.isCheckList}
          pinDate={note.pinDate}
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
        <div id="notesOptions">
          <Dropdown
            options={sortOptions}
            selectedOption={selectedSortOption}
            setSelectedOption={setSelectedSortOption}
          />
        </div>
        <div id="board-container">
          <div id="board">{noteElements}</div>
        </div>
      </div>
      {!isSearchMode && !isNewNoteDetectionDisabled && (
        <>
          <NewNoteEditor
            addNote={addNote}
            updateNote={updateNote}
            removeNote={removeNote}
            noteEditorMode={noteEditorMode}
            setNoteEditorMode={setNoteEditorMode}
            setCurrentNote={setCurrentNote}
            noteTitle={
              currentNote !== undefined ? currentNote.title : undefined
            }
            noteId={currentNote !== undefined ? currentNote.id : undefined}
            isNoteLocked={
              currentNote !== undefined ? currentNote.isNoteLocked : undefined
            }
            currentContent={
              currentNote !== undefined ? currentNote.content : undefined
            }
            noteColor={
              currentNote !== undefined ? currentNote.color : undefined
            }
            isChecklist={
              currentNote !== undefined ? currentNote.isCheckList : false
            }
            pinDate={currentNote !== undefined ? currentNote.pinDate : null}
            preventNewNoteDetection={preventNewNoteDetection}
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
        isVoice={isVoiceOn}
      />
      <Wave
        showWave={isVoiceOn}
        setVoice={setVoiceOn}
        transcript={transcript}
      />

      {Notification.permission !== "granted" && (
        <RequestNotificationPermission />
      )}
      {/* {transcript} */}
    </>
  );
};
