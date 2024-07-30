import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  blobToBase64,
  getClipBoardData,
  getUniqueId,
  isMobile,
  isValidImage,
} from "../../common/utils";
import { NoteProps } from "../note/NoteProps";
import { useToast } from "../../provider/toastProvider";
import "./newNoteDetector.css";
import { TerminalTextArea } from "./TerminalTextArea";

const TerminalContainer = styled.div`
  background: #1e1e1e;
  border-radius: 10px;
  max-width: 600px;
  width: min(600px, 85%);
  padding-right: 40px;
  display: grid;
  font-family: monospace;
  font-size: 16px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: start;
  align-items: center;
  flex-flow: column;
  padding-top: 180px;
`;

const ContentActions = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;

  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  background-color: #575353;

  padding-right: 40px;
`;

const SaveContentButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transform: translateX(80%);
  font-weight: 600;
  color: wheat;
`;

const TextActionButtons = styled.div`
  display: flex;
  width: 100%;
  padding-left: 2%;
  align-items: center;
`;
const ActionButton = styled.div`
  cursor: pointer;
  font-weight: 600;
  color: wheat;
`;

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return <Overlay onClick={() => onClose}>{children}</Overlay>;
};

export interface NewNoteEditorProps {
  addNote: (noteData: NoteProps) => void;
  updateNote: (
    noteId: string,
    updatedContent: string,
    updatedColor: string,
    isNoteLocked: boolean,
    title: string | null,
    isChecklist: boolean
  ) => void;
  removeNote: (noteId: string) => void;
  noteEditorMode: "new" | "modify" | "null";
  setNoteEditorMode: (mode: "new" | "modify" | "null") => void;
  preventNewNoteDetection: (isNewNoteDetectionEnabled: boolean) => void;

  //Optional params for modification
  noteId?: string;
  noteColor?: string;
  isNoteLocked?: boolean;
  currentContent?: string;
  noteTitle?: string | null;
  isChecklist?: boolean;
  setCurrentNote: (note: NoteProps | undefined) => void;
}

const isMobileBrowser = isMobile();

export const NewNoteEditor: React.FC<NewNoteEditorProps> = ({
  addNote,
  updateNote,
  removeNote,
  noteEditorMode,
  setNoteEditorMode,
  noteId,
  isNoteLocked,
  currentContent,
  setCurrentNote,
  preventNewNoteDetection,
  noteTitle,
  noteColor,
  isChecklist,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  let [inputValue, setInputValue] = useState<string>("");
  const textAreaRef = useRef<HTMLDivElement>(null);
  const [isImage, setIsImage] = useState<boolean>(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (currentContent !== undefined) {
      setInputValue(currentContent);
      if (isValidImage(currentContent)) {
        setIsImage(true);
      }
    }

    return () => {
      // whenever the component removes it will executes
      setIsImage(false);
    };
  }, [currentContent]);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setInputValue("");
    setIsImage(false);
    setModalIsOpen(false);

    setNoteEditorMode("null");
    setCurrentNote(undefined);
  };

  //This code is needed to set the pointer when first char is pressed

  useEffect(() => {
    if (inputValue.length === 1) {
      handleButtonClick();
    }
  }, [inputValue]);

  const handleButtonClick = () => {
    // Focus the input element when the button is clicked

    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  useEffect(() => {
    if (noteEditorMode !== "null") {
      handleButtonClick();
      openModal();
    }
  }, [noteEditorMode]);

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key;

    if (key !== "Enter") {
      openModal();
      if (noteEditorMode !== "modify") {
        setNoteEditorMode("new");
      }
      handleButtonClick();
    }
  };

  // Function to remove empty lines
  const removeEmptyLines = (input: string): string => {
    const lines = input.split("\n");

    // Remove empty lines from the start
    while (lines.length > 0 && lines[0].trim() === "") {
      lines.shift();
    }

    // Remove empty lines from the end
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }

    return lines.join("\n");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobileBrowser) {
      performAction();
      e.preventDefault();
      // Add logic here if you want to handle Enter key without Shift (e.g., execute command)
    }
  };

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "Enter" && !event.shiftKey && !isMobileBrowser) {
      performAction();
    } else if (event.key === "Enter" && isMobileBrowser) {
      document.execCommand("insertLineBreak");
      event.preventDefault();
    }
  };

  const suppressPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handlePasteEvent = async (event: any) => {
    // if not open, open the view
    if (!modalIsOpen) {
      openModal();
      setNoteEditorMode("new");
    }
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

  const performClipboardPaste = async () => {
    const clipBoardText = await getClipBoardData();
    if (clipBoardText !== null) {
      setInputValue((prevContent) => prevContent + clipBoardText);
    } else {
      showToast("Permission Denied", "#6a040f", 2000, "error");
    }
  };

  const performAction = () => {
    let noteContent = inputValue;

    if (
      textAreaRef.current &&
      textAreaRef.current.textContent &&
      textAreaRef.current.textContent.trim().length === 0
    ) {
      closeModal();
      return;
    } else if (textAreaRef.current && textAreaRef.current.textContent) {
      noteContent = textAreaRef.current.textContent;
    }

    if (noteEditorMode === "new") {
      const newData: NoteProps = {
        id: getUniqueId(),
        content: removeEmptyLines(noteContent),
        createDt: new Date(),
        color: "white",
        isImage: isImage,
        title: null, // SOME DAY WILL USE text summarization here
        removeNote: removeNote,
        updateNote: updateNote,
        isNoteLocked: false,
        setNoteEditorMode: setNoteEditorMode,
        setCurrentNote: setCurrentNote,
        preventNewNoteDetection: preventNewNoteDetection,
        isHighlighted: false,
        isCheckList: false,
      };
      addNote(newData);
    } else if (
      noteEditorMode === "modify" &&
      noteId !== undefined &&
      isNoteLocked !== undefined
    ) {
      updateNote(
        noteId,
        removeEmptyLines(noteContent),
        noteColor || "white",
        isNoteLocked,
        noteTitle || null,
        isChecklist || false
      );
    }

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
    <>
      <Modal isOpen={modalIsOpen} onClose={closeModal}>
        <>
          <TerminalContainer>
            <div className="modal-header">
              <div className="modal-buttons">
                <svg
                  onClick={closeModal}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M19 5L5 19M5.00001 5L19 19"
                      stroke="#ff5f56"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
                {/* <span className="minimize"></span>
                <span className="maximize"></span> */}
              </div>
              <div className="modal-title">Editor</div>
            </div>
            {!isImage && (
              <TerminalTextArea
                textAreaRef={textAreaRef}
                onKeyDown={handleKeyDown}
                onPaste={suppressPaste}
                text={inputValue}
              ></TerminalTextArea>
            )}
            {isImage && (
              <img className="imageNote" src={inputValue} alt={inputValue} />
            )}

            <ContentActions>
              <TextActionButtons>
                <ActionButton onClick={() => performClipboardPaste()}>
                  paste
                </ActionButton>
              </TextActionButtons>
              <SaveContentButton onClick={() => performAction()}>
                save
              </SaveContentButton>
            </ContentActions>
          </TerminalContainer>
        </>
      </Modal>
    </>
  );
};
