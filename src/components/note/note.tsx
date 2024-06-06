import React, { useEffect, useState } from "react";
import "./note.css";
import { getFormattedDate, isValidImage, maskString } from "../../common/utils";
import { ColorSet } from "../../common/colorSet";
import styled from "styled-components";
import { useToast } from "../../provider/toastProvider";
import { UpdateNote } from "../newNote/UpdateNote";
import { useSecurity } from "../../provider/securityProvider";
import { NoteProps } from "./NoteProps";

const TerminalContainer = styled.div<{
  bgColor: string;
  fontColor: string;
}>`
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.fontColor};
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  // width: max-content;
  // max-width: 800px;
  min-width: 300px;
  word-wrap: break-word;
  overflow: auto;
  position: relative;
  margin: 1%;
`;

const TerminalHeader = styled.div<{
  headerColor: string;
}>`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.headerColor};
  padding: 10px;
  border-radius: 10px 10px 0 0;

  /*Prevent text selection*/
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                supported by Chrome, Edge, Opera and Firefox */
`;

const Dot = styled.div`
  height: 12px;
  width: 12px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  margin: 0 5px;
  cursor: pointer;
`;

const Date = styled.div`
  border-radius: 50%;
  margin: 0 5px;
`;

const TerminalBody = styled.div`
  padding: 20px;
  font-size: 14px;
  white-space: pre-wrap;
  position: relative;
`;

export const Note: React.FC<NoteProps> = ({
  createDt,
  content,
  color,
  id,
  removeNote,
  updateNote,
  isNoteLocked,
}): JSX.Element => {
  const { showToast } = useToast();
  const [istNoteEditorOpen, toggleNoteEditor] = useState<boolean>(false);
  const [formattedContent, setFormattedContent] = useState<string>(content);
  const [isImage, setIsImage] = useState<boolean>(false);

  const [isLocked, toggleLock] = useState<boolean | null>(null);

  const [isFadingOut, setIsFadingOut] = useState(false);

  const { isLocked: isPageLocked } = useSecurity();

  const fadeOut = (cb: NodeJS.Timeout) => {
    setIsFadingOut(true);
  };

  const handleRemoveItem = () => {
    removeNote(id);
    setIsFadingOut(false);
  };

  useEffect(() => {
    if (isLocked !== null) {
      updateNote(id, content, color, !isLocked);
    }
  }, [isLocked]);

  useEffect(() => {
    const contentData =
      isPageLocked && isNoteLocked ? maskString(content, 3, 3, "#") : content;
    setFormattedContent(contentData);

    if (isValidImage(contentData)) {
      setIsImage(true);
    }
  }, [content, isPageLocked, isNoteLocked]);

  const copy = () => {
    navigator.clipboard.writeText(content);
    showToast("copied", "black", 3000);
  };

  const lock = () => {
    toggleLock(!isLocked);
    showToast(isLocked ? "locked" : "unlocked", "black", 3000);
  };

  const activeColorSet = ColorSet[color];
  return (
    <>
      <TerminalContainer
        bgColor={activeColorSet.noteBackground}
        fontColor={activeColorSet.fontColor}
        className={isFadingOut ? "item-fadeout" : "item"}
      >
        <TerminalHeader headerColor={activeColorSet.noteHeader}>
          <Dot
            color="#ff5f56"
            onClick={() => fadeOut(setTimeout(() => handleRemoveItem(), 300))}
          />
          <Dot color="#27c93f" onClick={copy} />
          <Dot color="#0A20FF" onClick={lock} />
          <Date>{getFormattedDate(createDt)}</Date>
          {/* <Dot color="#ffbd2e" />
           */}
        </TerminalHeader>
        <TerminalBody onDoubleClick={() => toggleNoteEditor(true)}>
          {!isImage && formattedContent}
          {isImage && (
            <img
              className="imageNote"
              src={formattedContent}
              alt={formattedContent}
            />
          )}
        </TerminalBody>
      </TerminalContainer>
      {istNoteEditorOpen && (
        <UpdateNote
          updateNote={updateNote}
          noteId={id}
          currentContent={content}
          toggleModal={toggleNoteEditor}
          currentColor={color}
          isNoteLocked={isNoteLocked}
        />
      )}
    </>
  );
};
