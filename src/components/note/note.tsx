import React, { useEffect, useState } from "react";
import "./note.css";
import { getFormattedDate } from "../../common/utils";
import { ColorSet } from "../../common/colorSet";
import styled from "styled-components";
import { useToast } from "../../provider/toastProvider";
import { UpdateNote } from "../newNote/UpdateNote";

export interface NoteProps {
  id: string;
  createDt: Date;
  content: string;
  color: string;
  removeNote: (noteId: string) => void;
  updateNote: (
    noteId: string,
    newContent: string,
    newColor: string,
    isNoteLocked: boolean
  ) => void;
  isNoteLocked: boolean;
}

const TerminalContainer = styled.div<{
  bgColor: string;
  fontColor: string;
}>`
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.fontColor};
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  margin: 20px;
  width: max-content;
  max-width: 800px;
  min-width: 300px;
  word-wrap: break-word;
  overflow: auto;
`;

const TerminalHeader = styled.div<{
  headerColor: string;
}>`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.headerColor};
  padding: 10px;
  border-radius: 10px 10px 0 0;
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

  const [isLocked, toggleLock] = useState<boolean | null>(null);

  const drop = () => {
    removeNote(id);
  };

  useEffect(() => {
    if (isLocked !== null) {
      updateNote(id, content, color, !isLocked);
    }
  }, [isLocked]);

  const copy = () => {
    navigator.clipboard.writeText(content);
    showToast("copied", "black", 3000);
  };

  const lock = () => {
    toggleLock(!isLocked);
  };

  const activeColorSet = ColorSet[color];
  return (
    <>
      <TerminalContainer
        bgColor={activeColorSet.noteBackground}
        fontColor={activeColorSet.fontColor}
      >
        <TerminalHeader headerColor={activeColorSet.noteHeader}>
          <Dot color="#ff5f56" onClick={drop} />
          <Dot color="#27c93f" onClick={copy} />
          <Dot color="#0A20FF" onClick={lock} />
          <Date>{getFormattedDate(createDt)}</Date>
          {/* <Dot color="#ffbd2e" />
           */}
        </TerminalHeader>
        <TerminalBody onDoubleClick={() => toggleNoteEditor(true)}>
          {content}
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
