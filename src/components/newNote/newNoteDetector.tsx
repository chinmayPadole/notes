import React, { useState, useEffect } from "react";
import "./newNoteDetector.css";
import { NoteProps } from "../note/note";
import { getUniqueId } from "../../common/utils";

export interface NewNoteDetectorProps {
  addNote: (noteData: NoteProps) => void;
  updateNote: (
    noteId: string,
    updatedContent: string,
    updatedColor: string
  ) => void;
  removeNote: (noteId: string) => void;
}

export const NewNoteDetector: React.FC<NewNoteDetectorProps> = ({
  addNote,
  updateNote,
  removeNote,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const handleKeyPress = (event: KeyboardEvent) => {
    // const key = event.key;
    // if (
    //   ((key >= "a" && key <= "z") ||
    //     (key >= "A" && key <= "Z") ||
    //     (key >= "0" && key <= "9") ||
    //     key === " ") &&
    //   key !== "Enter"
    // ) {
    //   setIsOpen(true);
    //   setTypedContent((prevContent) => prevContent + key);
    // } else if (key === "Enter" && !event.shiftKey) {
    //   performAction();
    // } else if (key === "Enter" && event.shiftKey) {
    //   setTypedContent((prevContent) => prevContent + "\n");
    // }

    if (
      (event.ctrlKey && event.key === "v") ||
      (event.shiftKey && event.key === "Insert")
    ) {
      // Do nothing, we handle pasting in the paste event listener
      return;
    }

    const key = event.key;

    if (key === "Escape") {
      closeModal();
    } else if (
      (key >= "a" && key <= "z") ||
      (key >= "A" && key <= "Z") ||
      (key >= "0" && key <= "9") ||
      key === " " ||
      key === "Enter" ||
      key === "Shift" ||
      key === "Tab" ||
      (key.match(
        /[\!\@\#\$\%\^\&\*\(\)\_\+\[\]\{\}\|\;\:\'\"\<\>\,\.\?\/\~\`\\\-]/
      ) &&
        key !== "Enter")
    ) {
      setIsOpen(true);

      if (key === "Enter" && !event.shiftKey) {
        performAction();
      } else if (key === "Enter" && event.shiftKey) {
        setTypedContent((prevContent) => prevContent + "\n");
      } else if (key === "Tab") {
        event.preventDefault(); // Prevent focus change
        setTypedContent((prevContent) => prevContent + "\t");
      } else if (!event.ctrlKey && !event.altKey && !event.metaKey) {
        setTypedContent((prevContent) => prevContent + key);
      }
    }
  };

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "Backspace" || event.key === "Delete") {
      setTypedContent((prevContent) => prevContent.slice(0, -1));
    }
  };

  const handlePaste = (event: any) => {
    const paste = (
      event.clipboardData || (window as any).clipboardData
    ).getData("text");
    setTypedContent((prevContent) => prevContent + paste);
  };

  const performAction = () => {
    if (typedContent.trim().length === 0) {
      closeModal();
      return;
    }
    console.log(typedContent.trim().length, typedContent);
    const newData: NoteProps = {
      id: getUniqueId(),
      content: typedContent,
      createDt: new Date(),
      color: "white",
      removeNote: removeNote,
      updateNote: updateNote,
    };
    addNote(newData);

    closeModal();
  };

  useEffect(() => {
    window.addEventListener("keypress", handleKeyPress);
    window.addEventListener("keydown", handleKeyDownEvent);
    window.addEventListener("paste", handlePaste);

    const cursorBlinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      window.removeEventListener("keydown", handleKeyDownEvent);
      window.removeEventListener("paste", handlePaste);
      clearInterval(cursorBlinkInterval);
    };
  }, [typedContent]);

  const closeModal = () => {
    setIsOpen(false);
    setTypedContent("");
  };

  return (
    <div>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-buttons">
                <span className="close" onClick={closeModal}></span>
                <span className="minimize"></span>
                <span className="maximize"></span>
              </div>
              <div className="modal-title">Terminal</div>
            </div>
            <div className="modal-content">
              <pre>
                {typedContent}
                {showCursor && <span className="cursor">|</span>}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
