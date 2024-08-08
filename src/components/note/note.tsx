import React, { useEffect, useRef, useState } from "react";
import "./note.css";
import {
  getFormattedDate,
  isMobile,
  maskString,
  splitTextIntoLines,
} from "../../common/utils";
import { ColorSet } from "../../common/colorSet";
import styled from "styled-components";
import { useToast } from "../../provider/toastProvider";
import { useSecurity } from "../../provider/securityProvider";
import { NoteProps } from "./NoteProps";
import { isReminderPossible, getReminderTime } from "../../common/remider";
import { useTimerManager } from "../../service/useTimeManager";
import DateTimePickerModal from "../datepicker/datepicker";
import { CollapsibleTextArea } from "./CollapsibleTextArea";
import { CollapsibleImage } from "./CollapsibleImage";
import { Task } from "./Task";

const TerminalContainer = styled.div<{
  $bgcolor: string;
  $fontcolor: string;
}>`
  background-color: ${(props) => props.$bgcolor};
  color: ${(props) => props.$fontcolor};

  border-radius: 5px;
  box-shadow: 2px 4px 12px #00000014;
  // width: max-content;
  // max-width: 800px;
  min-width: max(350px, calc(100vw - 100px));
  //max-width: max(350px, calc(100vw - 50px));
  word-wrap: break-word;
  position: relative;
  transition: background-color 0.3s ease-in;
`;

const TerminalHeader = styled.div<{
  $headercolor: string;
}>`
  // background: ${(props) => props.$headercolor};
  align-items: center;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  display: flex;
  border-bottom: 0.8px dotted #898686;
`;

export const Dot = styled.div`
  height: 12px;
  width: 12px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  margin: 0 5px;
  cursor: pointer;
`;

const DateElement = styled.div`
  text-align: start;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 250px;
  font-size: 12px;
  padding: 5px;

  @media (max-width: 500px) {
    width: 180px;
  }
`;

const TaskProgress = styled.div`
  color: #35b554;
  font-weight: 700;
`;

const ThemeSwitcher = styled.div<{
  $bgcolor: string;
}>`
  width: 40px;
  height: 15px;
  background: ${(props) => props.$bgcolor};
  border-radius: 10px;
  cursor: pointer;
`;

const TerminalBody = styled.div`
  padding: 20px 10px;
  letter-spacing: 0.007em !important;
  white-space: pre-wrap;
  position: relative;
  word-break: break-word;
`;

const TerminalFooter = styled.div<{
  $footercolor: string;
  $ischecklist: string;
}>`
  display: grid;
  grid-template-columns: ${({ $ischecklist }) =>
    $ischecklist === "true" ? "250px 1fr 0fr" : "1fr auto"};
  align-items: center;
  padding: 0 10px;
  background-color: ${(props) => props.$footercolor};
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  @media (max-width: 500px) {
    grid-template-columns: ${({ $ischecklist }) =>
      $ischecklist === "true" ? "180px 1fr 0fr" : "1fr auto"};
  }
`;

const NoteContainer = styled.div`
  padding-top: 10px;
  transition: border 0.4s linear;
  border-radius: 5px;
`;

const SVGAction = styled.div<{ $hoverbg: string }>`
  height: 25px;
  padding: 3px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s ease-in-out;
  & svg {
    width: 20px;
    height: 25px;
  }

  &:hover {
    color: #fff;
    background: ${(props) => props.$hoverbg};
  }
`;

const FooterAction = styled.div`
  width: max-content;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: 0.5em;
  padding: 5px;
  color: #000;

  & input {
    border-color: #000 !important;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 10px 10px 0 0;

  gap: 10px;
  width: 195px;
  min-width: 195px;
`;

const NoteTitleWrapper = styled.div`
  width: 95%;
  align-items: center;
  margin-right: 20px;
  display: flex;
  justify-content: end;
  min-width: 140px;

  & svg {
    max-width: 20px;
    max-height: 20px;
  }
`;
const NoteTitle = styled.div`
  font-weight: 600;
  font-style: italic;
  padding: 0 5px;
  cursor: text;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  text-align: end;
`;

export const Note: React.FC<NoteProps> = ({
  createDt,
  content,
  color,
  id,
  isImage,
  title,
  removeNote,
  updateNote,
  isNoteLocked,
  setNoteEditorMode,
  setCurrentNote,
  preventNewNoteDetection,
  isHighlighted,
  isCheckList,
  pinDate,
}): JSX.Element => {
  const { showToast } = useToast();
  const [noteTitle, setNoteTitle] = useState<string | null>(title);

  const [taskProgress, setTaskProgress] = useState<string>("");

  const [addCheckBoxes, toggleCheckList] = useState<boolean>(isCheckList);

  const [formattedContent, setFormattedContent] = useState<string>(content);
  const [colorSet, setActiveColorSet] = useState<{
    noteHeader: string;
    fontColor: string;
    noteBackground: string;
    noteFooter: string;
    actionButtonColor: string;
    actionButtonHoverColor: string;
    footerActionColor: string;
  }>(ColorSet["white"]);

  useEffect(() => {
    setActiveColorSet(ColorSet[color]);
  }, [color]);

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [taskStatus, setTaskStatus] = useState<number[]>([]);
  const [isNotePinned, setNotePinned] = useState<Date | null>(pinDate);
  const [lines, setLines] = useState<string[]>([]);
  const { isLocked: isPageLocked } = useSecurity();
  const [showReminderOption, setReminderOption] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const { addTimer } = useTimerManager();

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && noteRef.current) {
      noteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      noteRef.current.focus();
    }
  }, [isHighlighted]);

  const fadeOut = (cb: NodeJS.Timeout) => {
    setIsFadingOut(true);
  };

  const handleRemoveItem = () => {
    removeNote(id);
    unmount();
  };

  const unmount = () => {
    setIsFadingOut(false);
    setReminderOption(false);
    setReminderText("");
    setActiveColorSet(ColorSet["white"]);
    toggleCheckList(isCheckList);
    setTaskStatus([]);
    setShowOptions(false);
    setIsDatePickerOpen(false);
    setSelectedDate(null);
    setNoteTitle(title);
    setNotePinned(pinDate);
    setLines([]);
  };

  useEffect(() => {
    return () => {
      unmount();
    };
  }, []);

  useEffect(() => {
    const contentData =
      isPageLocked && isNoteLocked ? maskString(content, 3, 3, "#") : content;
    setFormattedContent(contentData);
  }, [content, isPageLocked, isNoteLocked]);

  useEffect(() => {
    const reminderText = isReminderPossible(content);
    if (reminderText !== null) {
      setReminderText(reminderText);
      setReminderOption(true);
    }
  }, [content, showOptions]);

  const copy = () => {
    navigator.clipboard.writeText(content);
    showToast("copied", "#333", 3000);
  };

  const lock = () => {
    updateNote(
      id,
      content,
      color,
      !isNoteLocked,
      noteTitle,
      addCheckBoxes,
      isNotePinned
    );
    showToast(isNoteLocked ? "locked" : "unlocked", "#333", 3000);
  };

  const handleNoteList = () => {
    const list = localStorage.getItem("tasks");
    if (taskStatus.length > 0) {
      if (list !== null) {
        let parsedTask: Task[] = JSON.parse(list);
        if (parsedTask.some((x) => x.noteId === id)) {
          parsedTask = parsedTask.map((task) =>
            task.noteId === id ? { ...task, status: taskStatus } : task
          );
          localStorage.setItem("tasks", JSON.stringify(parsedTask));
        } else {
          let task: Task = { noteId: id, status: taskStatus };
          parsedTask.push(task);
          localStorage.setItem("tasks", JSON.stringify(parsedTask));
        }
      } else {
        let tasks: Task[] = [];
        let task: Task = { noteId: id, status: taskStatus };
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
      }

      updateTaskProgress(taskStatus);
    }
  };

  useEffect(() => {
    setLines(splitTextIntoLines(content));
  }, []);

  useEffect(() => {
    if (isCheckList) {
      const list = localStorage.getItem("tasks");
      let status: number[] = [];
      if (list != null) {
        const task: Task[] = JSON.parse(list);
        if (task.some((x) => x.noteId === id)) {
          status =
            task.find((obj) => obj.noteId === id)?.status ||
            new Array(lines.length).fill(0);

          if (status.length !== lines.length) {
            status = new Array(lines.length).fill(0);
          }

          while (status.length < lines.length) {
            status.push(0);
          }
        }
      }
      if (status.length === 0) {
        status = new Array(lines.length).fill(0);
      }

      console.log(status);
      setTaskStatus(status);
    }
  }, [lines, addCheckBoxes]);

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

    if (completed === total && completed > 0) {
      setTaskProgress(`Completed (${completed} / ${total})`);
    } else {
      setTaskProgress(`${completed} / ${total}`);
    }
  };

  useEffect(() => {
    handleNoteList();
  }, [taskStatus]);

  useEffect(() => {
    handleNoteList();
    updateNote(
      id,
      content,
      color,
      !isNoteLocked,
      noteTitle,
      addCheckBoxes,
      isNotePinned
    );
  }, [addCheckBoxes, isNotePinned]);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const updateNoteColor = (color: string) => {
    setActiveColorSet(ColorSet[color]);
    updateNote(
      id,
      content,
      color,
      isNoteLocked,
      noteTitle,
      addCheckBoxes,
      isNotePinned
    );
  };

  useEffect(() => {
    if (selectedDate !== null) {
      const reminderDelay =
        new Date(selectedDate).getTime() - new Date().getTime();
      addTimer(
        reminderDelay,
        !isImage ? content : title || "Untitled image",
        isImage ? content : null,
        id
      );
    }
  }, [selectedDate]);

  useEffect(() => {
    if (noteTitle && noteTitle.length > 0 && noteTitle !== "new note") {
      updateNote(
        id,
        content,
        color,
        isNoteLocked,
        noteTitle,
        addCheckBoxes,
        isNotePinned
      );
    }
  }, [noteTitle]);

  const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.currentTarget.textContent &&
      e.currentTarget.textContent.length > 30 &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
      e.currentTarget.innerText.slice(0, 30);
    }
  };

  return (
    <>
      <NoteContainer ref={noteRef}>
        <TerminalContainer
          $bgcolor={colorSet.noteBackground}
          $fontcolor={colorSet.fontColor}
          className={isFadingOut ? "item-fadeout" : "item"}
        >
          <TerminalHeader
            $headercolor={colorSet.noteHeader}
            style={{
              animation: isHighlighted ? `highlight 1s 5` : "",
            }}
          >
            <HeaderActions>
              <SVGAction
                $hoverbg={colorSet.actionButtonHoverColor}
                onClick={() =>
                  fadeOut(setTimeout(() => handleRemoveItem(), 300))
                }
              >
                <svg
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
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
              </SVGAction>
              <SVGAction
                $hoverbg={colorSet.actionButtonHoverColor}
                onClick={copy}
              >
                <svg
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
                      d="M20.9983 10C20.9862 7.82497 20.8897 6.64706 20.1213 5.87868C19.2426 5 17.8284 5 15 5H12C9.17157 5 7.75736 5 6.87868 5.87868C6 6.75736 6 8.17157 6 11V16C6 18.8284 6 20.2426 6.87868 21.1213C7.75736 22 9.17157 22 12 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>{" "}
                    <path
                      d="M3 10V16C3 17.6569 4.34315 19 6 19M18 5C18 3.34315 16.6569 2 15 2H11C7.22876 2 5.34315 2 4.17157 3.17157C3.51839 3.82475 3.22937 4.69989 3.10149 6"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>{" "}
                  </g>
                </svg>
              </SVGAction>
              <SVGAction
                $hoverbg={colorSet.actionButtonHoverColor}
                onClick={lock}
              >
                {isNoteLocked && (
                  <svg
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
                        d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z"
                        stroke={colorSet.actionButtonColor}
                        strokeWidth="1.5"
                      ></path>{" "}
                      <path
                        d="M12 14V18"
                        stroke={colorSet.actionButtonColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                      <path
                        d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10"
                        stroke={colorSet.actionButtonColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
                )}
                {!isNoteLocked && (
                  <svg
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
                        d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z"
                        stroke={colorSet.actionButtonColor}
                        strokeWidth="1.5"
                      ></path>{" "}
                      <path
                        d="M6 10V8C6 4.68629 8.68629 2 12 2C14.7958 2 17.1449 3.91216 17.811 6.5"
                        stroke={colorSet.actionButtonColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                      <path
                        d="M12 14V18"
                        stroke={colorSet.actionButtonColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
                )}
              </SVGAction>
              <SVGAction
                $hoverbg={colorSet.actionButtonHoverColor}
                onClick={() => setIsDatePickerOpen(true)}
              >
                <svg
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
                      d="M12 9V13L14.5 15.5"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M3.5 4.5L7.50002 2"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M20.5 4.5L16.5 2"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    ></path>{" "}
                  </g>
                </svg>
              </SVGAction>
              <SVGAction
                $hoverbg={colorSet.actionButtonHoverColor}
                onClick={toggleOptions}
              >
                <svg
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
                      d="M12.0049 16.005L12.0049 15.995"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M12.0049 12.005L12.0049 11.995"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M12.0049 8.005L12.0049 7.995"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
              </SVGAction>
            </HeaderActions>
            <NoteTitleWrapper>
              <svg
                width="233px"
                height="233px"
                viewBox="0 0 28.00 28.00"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#007AFF"
                strokeWidth="0.308"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  stroke="#007AFF"
                  strokeWidth="0.11200000000000002"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M11.75 2C11.3358 2 11 2.33579 11 2.75C11 3.16421 11.3358 3.5 11.75 3.5H13.25V24.5H11.75C11.3358 24.5 11 24.8358 11 25.25C11 25.6642 11.3358 26 11.75 26H16.25C16.6642 26 17 25.6642 17 25.25C17 24.8358 16.6642 24.5 16.25 24.5H14.75V3.5H16.25C16.6642 3.5 17 3.16421 17 2.75C17 2.33579 16.6642 2 16.25 2H11.75Z"
                    fill="#007AFF"
                  ></path>{" "}
                  <path
                    d="M6.25 6.01958H12.25V7.51958H6.25C5.2835 7.51958 4.5 8.30308 4.5 9.26958V18.7696C4.5 19.7361 5.2835 20.5196 6.25 20.5196H12.25V22.0196H6.25C4.45507 22.0196 3 20.5645 3 18.7696V9.26958C3 7.47465 4.45507 6.01958 6.25 6.01958Z"
                    fill="#007AFF"
                  ></path>{" "}
                  <path
                    d="M21.75 20.5196H15.75V22.0196H21.75C23.5449 22.0196 25 20.5645 25 18.7696V9.26958C25 7.47465 23.5449 6.01958 21.75 6.01958H15.75V7.51958H21.75C22.7165 7.51958 23.5 8.30308 23.5 9.26958V18.7696C23.5 19.7361 22.7165 20.5196 21.75 20.5196Z"
                    fill="#007AFF"
                  ></path>{" "}
                </g>
              </svg>
              <NoteTitle
                ref={titleRef}
                contentEditable={true}
                spellCheck={false}
                onKeyDown={handleInput}
                onFocus={() => preventNewNoteDetection(true)}
                onBlur={() => {
                  preventNewNoteDetection(false);
                  if (
                    titleRef.current &&
                    titleRef.current.textContent &&
                    titleRef.current.textContent.length === 0
                  ) {
                    titleRef.current.textContent = "new note";
                  } else if (
                    titleRef.current &&
                    titleRef.current.textContent &&
                    titleRef.current.textContent.length > 0
                  ) {
                    setNoteTitle(titleRef.current.textContent);
                  }
                }}
                suppressContentEditableWarning={true}
              >
                {title === null ? "new note" : title}
              </NoteTitle>
              {isNotePinned && (
                <svg
                  className="pinSVG"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#000000"
                  strokeWidth="0.00024000000000000003"
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
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z"
                      fill={colorSet.actionButtonColor}
                    ></path>{" "}
                  </g>
                </svg>
              )}
            </NoteTitleWrapper>
          </TerminalHeader>
          <TerminalBody
            style={{
              animation: isHighlighted ? `highlight 1s 5` : "",
            }}
            onDoubleClick={() => {
              setNoteEditorMode("modify");
              setCurrentNote({
                createDt,
                content,
                color,
                id,
                title,
                isImage,
                removeNote,
                updateNote,
                isNoteLocked,
                setNoteEditorMode,
                setCurrentNote,
                preventNewNoteDetection,
                isHighlighted,
                isCheckList: isCheckList,
                pinDate,
              });
            }}
          >
            {(!isImage ||
              !addCheckBoxes ||
              (addCheckBoxes && lines.length > 0 && taskStatus.length > 0)) && (
              <CollapsibleTextArea
                text={formattedContent}
                maxLines={4}
                isCheckListMode={addCheckBoxes}
                taskStatus={taskStatus}
                // setTaskStatus={setTaskStatus}
                // setTaskProgress={setTaskProgress}
                handleTaskChange={handleTaskChange}
                noteId={id}
                taskProgress={taskProgress}
                lines={lines}
              />
            )}
            {isImage && (
              <CollapsibleImage
                src={formattedContent}
                alt="Content Corrupted 😔"
                maxHeight={200}
              />
            )}
          </TerminalBody>
          <TerminalFooter
            $footercolor={colorSet.noteFooter}
            $ischecklist={taskStatus.length > 0 ? "true" : "false"}
          >
            <DateElement className="selection-prevention">
              {getFormattedDate(createDt, "en-US", isMobile())}
            </DateElement>
            {isCheckList && <TaskProgress>{taskProgress}</TaskProgress>}
            <ThemeSwitcher
              $bgcolor={
                colorSet.noteBackground === "#2d2d2d" ? "#ffffff" : "#2d2d2d"
              }
              onClick={() =>
                updateNoteColor(
                  colorSet.noteBackground === "#2d2d2d" ? "white" : "black"
                )
              }
            />
          </TerminalFooter>
        </TerminalContainer>
        {showOptions && (
          <div
            className={`options-container ${
              showOptions ? "fade-in" : "fade-out"
            }`}
          >
            <button
              className="close-button selection-prevention"
              onClick={() => setShowOptions(false)}
            >
              ×
            </button>
            <div className="options-content">
              <FooterAction>
                <input
                  type="checkbox"
                  id="todo"
                  name="todo"
                  value="todo"
                  defaultChecked={addCheckBoxes}
                  onChange={() => toggleCheckList(!addCheckBoxes)}
                />
                <span>Tasks</span>
              </FooterAction>
              <FooterAction>
                <input
                  type="checkbox"
                  id="pinnote"
                  name="pinnote"
                  value="pinnote"
                  defaultChecked={isNotePinned ? true : false}
                  onChange={() =>
                    setNotePinned((prev) => (prev === null ? new Date() : null))
                  }
                />
                <span>Pin note</span>
              </FooterAction>
              {showReminderOption && (
                <button
                  onClick={() => {
                    const remiderData = getReminderTime(content);
                    if (remiderData !== undefined) {
                      addTimer(
                        remiderData.reminderTime,
                        !isImage
                          ? remiderData.reminderText
                          : title || "Untitled image",
                        isImage ? content : null,
                        id
                      ); // 5 seconds timer
                    }
                    setShowOptions(false);
                    showToast(`reminder set ${reminderText}`, "#333", 3000);
                  }}
                >
                  <p>set reminder {reminderText}?</p>
                </button>
              )}
            </div>
          </div>
        )}
      </NoteContainer>
      {isDatePickerOpen && (
        <DateTimePickerModal
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isOpen={isDatePickerOpen}
          setIsOpen={setIsDatePickerOpen}
        />
      )}
    </>
  );
};
