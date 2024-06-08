import React, { useState, useEffect, useRef } from "react";
import "./newNoteDetector.css";
import { NoteProps } from "../note/NoteProps";
import { blobToBase64, getUniqueId } from "../../common/utils";

export interface NewNoteDetectorProps {
  addNote: (noteData: NoteProps) => void;
  updateNote: (
    noteId: string,
    updatedContent: string,
    updatedColor: string,
    isNoteLocked: boolean
  ) => void;
  removeNote: (noteId: string) => void;
  openNoteEditor: boolean;
  toggleNoteEditorMode: (isNoteEditorOpen: boolean) => void;
}

export const NewNoteDetector: React.FC<NewNoteDetectorProps> = ({
  addNote,
  updateNote,
  removeNote,
  openNoteEditor,
  toggleNoteEditorMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const [isImage, setIsImage] = useState<boolean>(false);
  const [showCursor, setShowCursor] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    // Focus the input element when the button is clicked
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (openNoteEditor === true) {
      handleButtonClick();
      setIsOpen(true);
    }

    return () => {
      // whenever the component removes it will executes
      setIsOpen(false);
    };
  }, [openNoteEditor]);

  const handleKeyPress = (event: KeyboardEvent) => {
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
      handleButtonClick();
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

  const handlePaste = async (event: any) => {
    // if not open, open the view
    setIsOpen(true);
    setIsImage(false);
    let paste = (event.clipboardData || (window as any).clipboardData).getData(
      "text"
    );

    if (paste === undefined || paste === null || paste.trim().length === 0) {
      const items = (event.clipboardData || (window as any).clipboardData)
        .items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const URLObj = window.URL || window.webkitURL;
            const blobURL = URLObj.createObjectURL(blob);

            paste = await blobToBase64(blobURL);

            setIsImage(true);
          }
        }
      }
    }

    setTypedContent((prevContent) => prevContent + paste);
  };

  const performAction = () => {
    if (typedContent.trim().length === 0) {
      closeModal();
      return;
    }
    const newData: NoteProps = {
      id: getUniqueId(),
      content: typedContent,
      createDt: new Date(),
      color: "white",
      removeNote: removeNote,
      updateNote: updateNote,
      isNoteLocked: false,
      toggleNoteUpdateMode: toggleNoteEditorMode,
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
                {/* <span className="minimize"></span>
                <span className="maximize"></span> */}
              </div>
              <div className="modal-title">Editor</div>
            </div>
            <input
              type="text"
              ref={inputRef}
              placeholder="Focus me on button click"
              style={{
                position: "absolute",
                opacity: 0,
                height: 0,
                width: 0,
                border: "none",
                outline: "none",
              }}
            />
            <div className="modal-content">
              {!isImage && (
                <pre>
                  {typedContent}
                  {showCursor && <span className="cursor">|</span>}
                </pre>
              )}
              {isImage && (
                <img
                  className="imageNote"
                  src={typedContent}
                  alt={typedContent}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
