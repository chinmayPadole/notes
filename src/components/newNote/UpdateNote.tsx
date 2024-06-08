import React, { useState, useEffect } from "react";
import "./newNoteDetector.css";
import { blobToBase64 } from "../../common/utils";

export interface UpdateProps {
  noteId: string;
  updateNote: (
    noteId: string,
    updatedContent: string,
    updatedColor: string,
    isNoteLocked: boolean
  ) => void;
  currentContent: string;
  toggleModal: React.Dispatch<React.SetStateAction<boolean>>;
  currentColor: string;
  isNoteLocked: boolean;
}

export const UpdateNote: React.FC<UpdateProps> = ({
  noteId,
  updateNote,
  currentContent,
  toggleModal,
  currentColor,
  isNoteLocked,
}) => {
  const [typedContent, setTypedContent] = useState(currentContent);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [showCursor, setShowCursor] = useState(true);

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
    updateNote(noteId, typedContent, "white", isNoteLocked);

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
    toggleModal(false);
    setTypedContent("");
  };

  return (
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
        <div className="modal-content">
          {!isImage && (
            <pre>
              {typedContent}
              {showCursor && <span className="cursor">|</span>}
            </pre>
          )}
          {isImage && (
            <img className="imageNote" src={typedContent} alt={typedContent} />
          )}
        </div>
      </div>
    </div>
  );
};
