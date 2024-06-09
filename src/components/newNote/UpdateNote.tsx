import React, { useState, useEffect, useRef } from "react";
import "./newNoteDetector.css";
import { blobToBase64, isMobile } from "../../common/utils";
import styled from "styled-components";

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
  justify-content: center;
  align-items: center;
  flex-flow: column;
  z-index: 1;
`;

const ContentActions = styled.div`
  width: 100%;
  height: 60px;
  margin-bottom: min(70%, 380px);
  max-width: 600px;
  width: min(600px, 85%);
  display: flex;
  justify-content: flex-end;
`;
const SaveContentButton = styled.div`
  width: max-content;
  cursor: pointer;
  svg {
    width: 50px;
    height: 50px;
    fill: #27c93f;
  }
`;

const isMobileBrowser = isMobile();

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element[];
}> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return <Overlay onClick={() => onClose}>{children}</Overlay>;
};

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
  const [modalIsOpen, setModalIsOpen] = useState(true);
  let [inputValue, setInputValue] = useState<string>(currentContent);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isImage, setIsImage] = useState<boolean>(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setInputValue("");
    setModalIsOpen(false);
    toggleModal(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobileBrowser) {
      e.preventDefault();
      // Add logic here if you want to handle Enter key without Shift (e.g., execute command)
    }
  };

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "Enter" && !event.shiftKey && !isMobileBrowser) {
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
    updateNote(noteId, inputValue, "white", isNoteLocked);

    closeModal();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDownEvent);
    window.addEventListener("paste", handlePasteEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyDownEvent);
      window.removeEventListener("paste", handlePasteEvent);
    };
  }, [inputValue]);

  return (
    <>
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
        <ContentActions>
          <SaveContentButton onClick={() => performAction()}>
            <svg
              fill="#ffffff"
              width="151px"
              height="151px"
              viewBox="0 0 24 24"
              id="send"
              data-name="Line Color"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <line id="secondary" x1="7" y1="12" x2="11" y2="12"></line>
                <path
                  id="primary"
                  d="M5.44,4.15l14.65,7a1,1,0,0,1,0,1.8l-14.65,7A1,1,0,0,1,4.1,18.54l2.72-6.13a1.06,1.06,0,0,0,0-.82L4.1,5.46A1,1,0,0,1,5.44,4.15Z"
                ></path>
              </g>
            </svg>
          </SaveContentButton>
        </ContentActions>
      </Modal>
    </>
  );
};
