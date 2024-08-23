import React, { useState, useRef, useEffect } from "react";
import "./collapsibleStyle.css";
import styled from "styled-components";

interface CollapsibleTextAreaProps {
  text: string;
  maxLines: number;
  isCheckListMode: boolean;
  // setTaskStatus: (value: React.SetStateAction<number[]>) => void;
  // setTaskProgress: (value: React.SetStateAction<string>) => void;
  taskStatus: number[];
  noteId: string;
  taskProgress: string;
  lines: string[];
  handleTaskChange: (key: number) => void;
}

const CollapsedNoteBody = styled.div`
  cursor: pointer;
  & svg {
    width: 50px;
    height: 50px;
  }
`;

export const CollapsibleTextArea: React.FC<CollapsibleTextAreaProps> = ({
  text,
  maxLines,
  isCheckListMode,
  taskStatus,
  noteId,
  handleTaskChange,
  taskProgress,
  lines,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const [isCompletedTaskHidden, setCompletedTaskHidden] = useState(true);

  useEffect(() => {
    return () => {
      setIsOverflowing(false);
      setIsExpanded(false);
    };
  }, []);

  useEffect(() => {
    if (textAreaRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textAreaRef.current).lineHeight || "0"
      );
      const maxHeight = lineHeight * maxLines;

      const scrollHeight = isCheckListMode
        ? lines.length * 18
        : textAreaRef.current.scrollHeight;
      setIsOverflowing(scrollHeight > maxHeight);
    }
  }, [text, maxLines, isCheckListMode]);

  const createLinkifiedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        const url = part.startsWith("http") ? part : `http://${part}`;
        return (
          <a
            key={index}
            href={url}
            style={{ color: "#029cfd" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {taskProgress.includes("Completed") && isCompletedTaskHidden && (
        <CollapsedNoteBody
          onClick={() => setCompletedTaskHidden((prev) => !prev)}
        >
          <svg
            viewBox="0 -0.5 25 25"
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
                d="M5.5 12.5L10.167 17L19.5 8"
                stroke="#35b554"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>{" "}
            </g>
          </svg>
        </CollapsedNoteBody>
      )}
      {(!taskProgress.includes("Completed") || !isCompletedTaskHidden) &&
        (taskStatus.length > 0 || !isCheckListMode) && (
          <div>
            {!isCheckListMode && (
              <div
                ref={textAreaRef}
                style={{
                  maxHeight: isExpanded ? "none" : `${maxLines * 1.4}em`,
                  overflow: "hidden",
                }}
              >
                {createLinkifiedText(text)}
              </div>
            )}
            {isCheckListMode && (
              <div
                ref={textAreaRef}
                style={{
                  maxHeight: isExpanded ? "none" : `${maxLines * 2.9}em`,
                  overflow: "hidden",
                }}
              >
                {getTaskList()}
              </div>
            )}
            {isOverflowing && (
              <button
                className="collapsibleBtn selection-prevention"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less..." : "Show more..."}
              </button>
            )}
          </div>
        )}
    </>
  );

  function getTaskList(): JSX.Element[] {
    if (lines.length === 0) {
      return [];
    }
    return lines.map((line, index) => {
      return (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "25px auto",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <input
            id={noteId + index}
            type="checkbox"
            style={{ transform: "scale(0.6)" }}
            defaultChecked={taskStatus[index] === 1 ? true : false}
            onChange={() => handleTaskChange(index)}
          />
          <span
            style={{
              marginLeft: "8px",
              textDecoration: taskStatus[index] === 1 ? "line-through" : "none",
              textDecorationThickness: taskStatus[index] === 1 ? "2px" : "1px",
            }}
          >
            {createLinkifiedText(line)}
          </span>
        </div>
      );
    });
  }
};
