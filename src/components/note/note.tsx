import React from "react";
import "./note.css";
import { getFormattedDate } from "../../common/utils";
import { ColorSet } from "../../common/colorSet";
import styled from "styled-components";

export interface NoteProps {
  id: string;
  createDt: Date;
  content: string;
  color: string;
  removeNote: (noteId: string) => void;
  updateNote: (noteId: string, newContent: string, newColor: string) => void;
}

const TerminalContainer = styled.div<{
  backgroundColor: string;
  fontColor: string;
}>`
  background-color: ${(props) => props.backgroundColor};
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
}): JSX.Element => {
  const drop = () => {
    removeNote(id);
  };
  const update = () => {
    updateNote(id, content, color);
  };

  const activeColorSet = ColorSet[color];
  return (
    <TerminalContainer
      backgroundColor={activeColorSet.noteBackground}
      fontColor={activeColorSet.fontColor}
    >
      <TerminalHeader headerColor={activeColorSet.noteHeader}>
        <Dot color="#ff5f56" onClick={drop} />
        <Date>{getFormattedDate(createDt)}</Date>
        {/* <Dot color="#ffbd2e" />
        <Dot color="#27c93f" /> */}
      </TerminalHeader>
      <TerminalBody>{content}</TerminalBody>
    </TerminalContainer>
  );
};
