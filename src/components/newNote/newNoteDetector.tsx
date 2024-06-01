import React, { useState, useEffect } from "react";
import "./newNoteDetector.css";

export const NewNoteDetector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [typedContent, setTypedContent] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key;
    if (
      ((key >= "a" && key <= "z") ||
        (key >= "A" && key <= "Z") ||
        (key >= "0" && key <= "9") ||
        key === " ") &&
      key !== "Enter"
    ) {
      setIsOpen(true);
      setTypedContent((prevContent) => prevContent + key);
    } else if (key === "Enter" && !event.shiftKey) {
      performAction();
    } else if (key === "Enter" && event.shiftKey) {
      setTypedContent((prevContent) => prevContent + "\n");
    }
  };

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const performAction = () => {
    // Add the action to be performed on Enter key press
    alert(`Performing action with typed content: ${typedContent}`);
  };

  useEffect(() => {
    window.addEventListener("keypress", handleKeyPress);
    window.addEventListener("keydown", handleKeyDownEvent);
    const cursorBlinkInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
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
