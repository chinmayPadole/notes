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
    console.log(taskProgress);
    console.log(taskStatus);
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

  // useEffect(() => {
  //   if (isCheckListMode) {
  //     const list = localStorage.getItem("tasks");
  //     let status: number[] = [];
  //     if (list != null) {
  //       const task: Task[] = JSON.parse(list);
  //       if (task.some((x) => x.noteId === noteId)) {
  //         status =
  //           task.find((obj) => obj.noteId === noteId)?.status ||
  //           new Array(lines.length).fill(0);

  //         if (status.length !== lines.length) {
  //           status = new Array(lines.length).fill(0);
  //         }

  //         while (status.length < lines.length) {
  //           status.push(0);
  //         }
  //         // const newTask = task.filter((item) => item.noteId !== noteId);
  //         // localStorage.setItem("tasks", JSON.stringify(newTask));
  //       }
  //     }
  //     if (status.length === 0) {
  //       status = new Array(lines.length).fill(0);
  //     }

  //     setTaskStatus(status);
  //   }
  // }, [lines, isCheckListMode]);

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

  // const handleTaskChange = (key: number) => {
  //   let status = [...taskStatus];
  //   if (key >= 0 && key < status.length) {
  //     status[key] = status[key] === 0 ? 1 : 0;
  //   }
  //   setTaskStatus(status);
  //   updateTaskProgress(status);
  // };

  // const updateTaskProgress = (status: number[]) => {
  //   let completed = status.filter((num) => num === 1).length;
  //   let total = status.length;

  //   if (completed === total && completed > 0) {
  //     setTaskProgress(`Completed (${completed} / ${total})`);
  //   } else {
  //     setTaskProgress(`${completed} / ${total}`);
  //   }
  // };

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
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
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
