import React from "react";
import "./note.css";
import { getFormattedDate } from "../../common/utils";
import { ColorSet } from "../../common/colorSet";

export interface NoteProps {
  id: string;
  createDt: Date;
  content: string;
  color: string;
  removeNote: (noteId: string) => void;
}

export const Note: React.FC<NoteProps> = ({
  createDt,
  content,
  color,
  id,
  removeNote,
}): JSX.Element => {
  const drop = () => {
    removeNote(id);
  };

  const activeColorSet = ColorSet[color];
  return (
    <div
      style={{
        background: activeColorSet.backgroundColor,
        color: activeColorSet.fontColor,
      }}
      className="noteParent"
    >
      <div className="noteHeader">
        <div className="creatDate">{getFormattedDate(createDt)}</div>
        <button onClick={drop}>Delete Note</button>
      </div>
      <div className="noteContent">{content}</div>
    </div>
  );
};
