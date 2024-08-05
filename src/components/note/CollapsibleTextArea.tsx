import React, { useState, useRef, useEffect } from "react";
import "./collapsibleStyle.css";
import { splitTextIntoLines } from "../../common/utils";
import { Task } from "./Task";

interface CollapsibleTextAreaProps {
  text: string;
  maxLines: number;
  isCheckListMode: boolean;
  setTaskStatus: (value: React.SetStateAction<number[]>) => void;
  setTaskProgress: (value: React.SetStateAction<string>) => void;
  taskStatus: number[];
  noteId: string;
}

export const CollapsibleTextArea: React.FC<CollapsibleTextAreaProps> = ({
  text,
  maxLines,
  isCheckListMode,
  setTaskStatus,
  taskStatus,
  noteId,
  setTaskProgress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textAreaRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const totalLines = splitTextIntoLines(text);
    if (textAreaRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textAreaRef.current).lineHeight || "0"
      );
      const maxHeight = lineHeight * maxLines;

      const scrollHeight = isCheckListMode
        ? totalLines.length * 18
        : textAreaRef.current.scrollHeight;
      setIsOverflowing(scrollHeight > maxHeight);
    }

    setLines(totalLines);
  }, [text, maxLines, isCheckListMode]);

  useEffect(() => {
    if (isCheckListMode) {
      const list = localStorage.getItem("tasks");
      let status: number[] = [];
      if (list != null) {
        const task: Task[] = JSON.parse(list);
        if (task.some((x) => x.noteId === noteId)) {
          status = task.find((obj) => obj.noteId === noteId)?.status || [];

          while (status.length < lines.length) {
            status.push(0);
          }
          // const newTask = task.filter((item) => item.noteId !== noteId);
          // localStorage.setItem("tasks", JSON.stringify(newTask));
        }
      } else {
        status = new Array(lines.length).fill(0);
      }

      setTaskStatus(status);
    }
  }, [lines, isCheckListMode]);

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

  const handleTaskChange = (key: number) => {
    let status = [...taskStatus];
    if (key >= 0 && key < status.length) {
      status[key] = status[key] === 0 ? 1 : 0;
    }
    setTaskStatus(status);
    updateTaskProgress(status);
  };

  const updateTaskProgress = (status: number[]) => {
    let completed = status.filter((num) => num === 1).length;
    let total = status.length;
    setTaskProgress(`${completed} / ${total}`);
  };

  return (
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
  );

  function getTaskList(): React.ReactNode {
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
