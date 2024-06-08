import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { blobToBase64, getUniqueId } from "../../common/utils";
import { NoteProps } from "../note/NoteProps";

const TerminalTextArea = styled.textarea`
  width: 100%;
  color: #c5c5c5;
  background: #1e1e1e;
  border: none;
  outline: none;
  resize: none;

  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  padding: 20px;
`;

const TerminalContainer = styled.div`
  background: transparent;
  border-radius: 10px;
  width: 600px;
  margin: 50px auto;
  color: lime;
  font-family: monospace;
  font-size: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </Overlay>
  );
};

export interface NewNoteEditorProps {
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

export const NewNoteEditor: React.FC<NewNoteEditorProps> = ({
  addNote,
  updateNote,
  removeNote,
  openNoteEditor,
  toggleNoteEditorMode,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  let [inputValue, setInputValue] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isImage, setIsImage] = useState<boolean>(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setInputValue("");
    setModalIsOpen(false);
  };

  const handleButtonClick = () => {
    // Focus the input element when the button is clicked

    if (textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.setSelectionRange(
        inputValue.length,
        inputValue.length
      );
    }
  };

  useEffect(() => {
    if (openNoteEditor === true) {
      handleButtonClick();
      openModal();
    }

    return () => {
      // whenever the component removes it will executes
      closeModal();
    };
  }, [openNoteEditor]);

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key;
    if (
      !modalIsOpen &&
      ((key >= "a" && key <= "z") ||
        (key >= "A" && key <= "Z") ||
        (key >= "0" && key <= "9") ||
        key === " " ||
        key === "Enter" ||
        key === "Shift" ||
        key === "Tab" ||
        key.match(
          /[\!\@\#\$\%\^\&\*\(\)\_\+\[\]\{\}\|\;\:\'\"\<\>\,\.\?\/\~\`\\\-]/
        ))
    ) {
      openModal();
      handleButtonClick();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Add logic here if you want to handle Enter key without Shift (e.g., execute command)
    }
  };

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "Enter" && !event.shiftKey) {
      performAction();
    }
  };

  const suppressPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handlePasteEvent = async (event: any) => {
    // if not open, open the view
    openModal();
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

    setInputValue((prevContent) => prevContent + paste);
  };

  const performAction = () => {
    if (inputValue.trim().length === 0) {
      closeModal();
      return;
    }
    const newData: NoteProps = {
      id: getUniqueId(),
      content: inputValue,
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
    window.addEventListener("paste", handlePasteEvent);

    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      window.removeEventListener("keydown", handleKeyDownEvent);
      window.removeEventListener("paste", handlePasteEvent);
    };
  }, [inputValue]);

  return (
    <div>
      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <TerminalContainer>
          <div className="modal-header">
            <div className="modal-buttons">
              <span className="close" onClick={closeModal}></span>
              {/* <span className="minimize"></span>
                <span className="maximize"></span> */}
            </div>
            <div className="modal-title">Editor</div>
          </div>
          {!isImage && (
            <TerminalTextArea
              ref={textAreaRef}
              rows={10}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={suppressPaste}
            />
          )}
          {isImage && (
            <img className="imageNote" src={inputValue} alt={inputValue} />
          )}
        </TerminalContainer>
      </Modal>
    </div>
  );
};
