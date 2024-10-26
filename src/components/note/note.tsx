import React, { useEffect, useRef, useState } from "react";
import "./note.css";
import {
  base64ToBlob,
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

const CollapseButton = styled.div`
  width: 20px;
  height: 20px;
  padding-left: 10px;
  cursor: pointer;
  & svg {
    width: 20px;
    height: 20px;
  }
`;

const CollapsedView = styled.div`
  font-weight: 900;
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
    $ischecklist === "true" ? "250px 1fr 0fr 30px" : "1fr auto 30px"};
  align-items: center;
  padding: 0 10px;
  background-color: ${(props) => props.$footercolor};
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  @media (max-width: 500px) {
    grid-template-columns: ${({ $ischecklist }) =>
      $ischecklist === "true" ? "180px 1fr 0fr 30px" : "1fr auto 30px"};
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
  isCollapsed,
}): JSX.Element => {
  const { showToast } = useToast();
  const [noteTitle, setNoteTitle] = useState<string | null>(title);

  const [taskProgress, setTaskProgress] = useState<string>("");

  const [addCheckBoxes, toggleCheckList] = useState<boolean>(isCheckList);

  const [isShareButtonVisible, enableShareButton] = useState<boolean>(false);

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
  const [isNoteCollapsed, setNoteCollapsed] = useState<boolean>(isCollapsed);
  const [lines, setLines] = useState<string[]>([]);
  const { isPageLocked, isSessionUnlocked, toggleLockPinModal } = useSecurity();
  const [showReminderOption, setReminderOption] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isNoteContentVisible, toggleNoteContentVisibility] = useState(false);
  const { addTimer } = useTimerManager();

  const optionsMenuRef = useRef<HTMLDivElement>(null);

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
    if (!!navigator.share) {
      enableShareButton(true);
    }

    return () => {
      unmount();
    };
  }, []);

  useEffect(() => {
    const contentData =
      isPageLocked && isNoteLocked && !isNoteContentVisible
        ? maskString(content, 3, 3, "#")
        : content;
    setFormattedContent(contentData);
  }, [content, isPageLocked, isNoteLocked, isNoteContentVisible]);

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
    if (isNoteLocked && isSessionUnlocked) {
      updateNote(
        id,
        content,
        color,
        false,
        noteTitle,
        addCheckBoxes,
        isNotePinned,
        isNoteCollapsed
      );
    } else if (isNoteLocked && !isSessionUnlocked) {
      console.log("Test");
      showToast("Session locked", "#333", 3000);
    } else {
      updateNote(
        id,
        content,
        color,
        true,
        noteTitle,
        addCheckBoxes,
        isNotePinned,
        isNoteCollapsed
      );
    }

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

      setTaskStatus(status);
    }
  }, [lines, addCheckBoxes, isCheckList]);

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
      isNotePinned,
      isNoteCollapsed
    );
  }, [addCheckBoxes, isNotePinned, isNoteCollapsed]);

  const toggleOptions = () => {
    setShowOptions(!showOptions);

    setTimeout(() => {
      optionsMenuRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 0);
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
      isNotePinned,
      isNoteCollapsed
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
    if (noteTitle && noteTitle.length > 0 && noteTitle !== "untitled") {
      updateNote(
        id,
        content,
        color,
        isNoteLocked,
        noteTitle,
        addCheckBoxes,
        isNotePinned,
        isNoteCollapsed
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

  const ShareNotes = async () => {
    try {
      if (!isImage) {
        await navigator.share({
          title: "Note",
          text: content || "",
        });
      } else {
        const blob = base64ToBlob(content, "image/png"); // Assuming the image is PNG

        // Convert Blob to File (optional but provides a file name)
        const file = new File([blob], "shared-image-via-supernotes.png", {
          type: "image/png",
        });

        // Check if the browser can share files

        await navigator.share({
          title: "Shared Image via Super Notes",
          text: "Check out this image!",
          files: [file], // Share the file
        });
      }
      //console.log("Note shared successfully!");
    } catch (error) {
      console.error("Error sharing the note:", error);
    }
  };

  const toggleHiddenNoteVisibility = () => {
    if (isSessionUnlocked) {
      toggleNoteContentVisibility((prev) => !prev);
    } else {
      toggleLockPinModal(true);
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
              {isNoteLocked && (
                <SVGAction
                  $hoverbg={colorSet.actionButtonHoverColor}
                  onClick={() => toggleHiddenNoteVisibility()}
                >
                  {!isNoteContentVisible && (
                    <svg
                      viewBox="0 0 24.00 24.00"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke={colorSet.actionButtonColor}
                      strokeWidth="1.5"
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
                          d="M2.68936 6.70456C2.52619 6.32384 2.08528 6.14747 1.70456 6.31064C1.32384 6.47381 1.14747 6.91472 1.31064 7.29544L2.68936 6.70456ZM15.5872 13.3287L15.3125 12.6308L15.5872 13.3287ZM9.04145 13.7377C9.26736 13.3906 9.16904 12.926 8.82185 12.7001C8.47466 12.4742 8.01008 12.5725 7.78417 12.9197L9.04145 13.7377ZM6.37136 15.091C6.14545 15.4381 6.24377 15.9027 6.59096 16.1286C6.93815 16.3545 7.40273 16.2562 7.62864 15.909L6.37136 15.091ZM22.6894 7.29544C22.8525 6.91472 22.6762 6.47381 22.2954 6.31064C21.9147 6.14747 21.4738 6.32384 21.3106 6.70456L22.6894 7.29544ZM19 11.1288L18.4867 10.582V10.582L19 11.1288ZM19.9697 13.1592C20.2626 13.4521 20.7374 13.4521 21.0303 13.1592C21.3232 12.8663 21.3232 12.3914 21.0303 12.0985L19.9697 13.1592ZM11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5H11.25ZM16.3714 15.909C16.5973 16.2562 17.0619 16.3545 17.409 16.1286C17.7562 15.9027 17.8545 15.4381 17.6286 15.091L16.3714 15.909ZM5.53033 11.6592C5.82322 11.3663 5.82322 10.8914 5.53033 10.5985C5.23744 10.3056 4.76256 10.3056 4.46967 10.5985L5.53033 11.6592ZM2.96967 12.0985C2.67678 12.3914 2.67678 12.8663 2.96967 13.1592C3.26256 13.4521 3.73744 13.4521 4.03033 13.1592L2.96967 12.0985ZM12 13.25C8.77611 13.25 6.46133 11.6446 4.9246 9.98966C4.15645 9.16243 3.59325 8.33284 3.22259 7.71014C3.03769 7.3995 2.90187 7.14232 2.8134 6.96537C2.76919 6.87696 2.73689 6.80875 2.71627 6.76411C2.70597 6.7418 2.69859 6.7254 2.69411 6.71533C2.69187 6.7103 2.69036 6.70684 2.68957 6.70503C2.68917 6.70413 2.68896 6.70363 2.68892 6.70355C2.68891 6.70351 2.68893 6.70357 2.68901 6.70374C2.68904 6.70382 2.68913 6.70403 2.68915 6.70407C2.68925 6.7043 2.68936 6.70456 2 7C1.31064 7.29544 1.31077 7.29575 1.31092 7.29609C1.31098 7.29624 1.31114 7.2966 1.31127 7.2969C1.31152 7.29749 1.31183 7.2982 1.31218 7.299C1.31287 7.30062 1.31376 7.30266 1.31483 7.30512C1.31698 7.31003 1.31988 7.31662 1.32353 7.32483C1.33083 7.34125 1.34115 7.36415 1.35453 7.39311C1.38127 7.45102 1.42026 7.5332 1.47176 7.63619C1.57469 7.84206 1.72794 8.13175 1.93366 8.47736C2.34425 9.16716 2.96855 10.0876 3.8254 11.0103C5.53867 12.8554 8.22389 14.75 12 14.75V13.25ZM15.3125 12.6308C14.3421 13.0128 13.2417 13.25 12 13.25V14.75C13.4382 14.75 14.7246 14.4742 15.8619 14.0266L15.3125 12.6308ZM7.78417 12.9197L6.37136 15.091L7.62864 15.909L9.04145 13.7377L7.78417 12.9197ZM22 7C21.3106 6.70456 21.3107 6.70441 21.3108 6.70427C21.3108 6.70423 21.3108 6.7041 21.3109 6.70402C21.3109 6.70388 21.311 6.70376 21.311 6.70368C21.3111 6.70352 21.3111 6.70349 21.3111 6.7036C21.311 6.7038 21.3107 6.70452 21.3101 6.70576C21.309 6.70823 21.307 6.71275 21.3041 6.71924C21.2983 6.73223 21.2889 6.75309 21.2758 6.78125C21.2495 6.83757 21.2086 6.92295 21.1526 7.03267C21.0406 7.25227 20.869 7.56831 20.6354 7.9432C20.1669 8.69516 19.4563 9.67197 18.4867 10.582L19.5133 11.6757C20.6023 10.6535 21.3917 9.56587 21.9085 8.73646C22.1676 8.32068 22.36 7.9668 22.4889 7.71415C22.5533 7.58775 22.602 7.48643 22.6353 7.41507C22.6519 7.37939 22.6647 7.35118 22.6737 7.33104C22.6782 7.32097 22.6818 7.31292 22.6844 7.30696C22.6857 7.30398 22.6867 7.30153 22.6876 7.2996C22.688 7.29864 22.6883 7.29781 22.6886 7.29712C22.6888 7.29677 22.6889 7.29646 22.689 7.29618C22.6891 7.29604 22.6892 7.29585 22.6892 7.29578C22.6893 7.29561 22.6894 7.29544 22 7ZM18.4867 10.582C17.6277 11.3882 16.5739 12.1343 15.3125 12.6308L15.8619 14.0266C17.3355 13.4466 18.5466 12.583 19.5133 11.6757L18.4867 10.582ZM18.4697 11.6592L19.9697 13.1592L21.0303 12.0985L19.5303 10.5985L18.4697 11.6592ZM11.25 14V16.5H12.75V14H11.25ZM14.9586 13.7377L16.3714 15.909L17.6286 15.091L16.2158 12.9197L14.9586 13.7377ZM4.46967 10.5985L2.96967 12.0985L4.03033 13.1592L5.53033 11.6592L4.46967 10.5985Z"
                          fill="#1C274C"
                        ></path>{" "}
                      </g>
                    </svg>
                  )}
                  {isNoteContentVisible && (
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
                          d="M3.27489 15.2957C2.42496 14.1915 2 13.6394 2 12C2 10.3606 2.42496 9.80853 3.27489 8.70433C4.97196 6.49956 7.81811 4 12 4C16.1819 4 19.028 6.49956 20.7251 8.70433C21.575 9.80853 22 10.3606 22 12C22 13.6394 21.575 14.1915 20.7251 15.2957C19.028 17.5004 16.1819 20 12 20C7.81811 20 4.97196 17.5004 3.27489 15.2957Z"
                          stroke={colorSet.actionButtonColor}
                          strokeWidth="1.5"
                        ></path>{" "}
                        <path
                          d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                          stroke={colorSet.actionButtonColor}
                          strokeWidth="1.5"
                        ></path>{" "}
                      </g>
                    </svg>
                  )}
                </SVGAction>
              )}
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
                    titleRef.current.textContent = "untitled";
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
                {title === null ? "untitled" : title}
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
                isCollapsed,
              });
            }}
          >
            {!isCollapsed && (
              <>
                {!isImage &&
                  (!addCheckBoxes ||
                    (addCheckBoxes &&
                      lines.length > 0 &&
                      taskStatus.length > 0)) && (
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
              </>
            )}
            {isCollapsed && (
              <CollapsedView onClick={() => setNoteCollapsed((prev) => !prev)}>
                . . .
              </CollapsedView>
            )}
          </TerminalBody>
          <TerminalFooter
            $footercolor={colorSet.noteFooter}
            $ischecklist={
              addCheckBoxes && taskStatus.length > 0 ? "true" : "false"
            }
          >
            <DateElement className="selection-prevention">
              {getFormattedDate(createDt, "en-US", isMobile())}
            </DateElement>
            {addCheckBoxes && taskStatus.length > 0 && (
              <TaskProgress>{taskProgress}</TaskProgress>
            )}
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
            <CollapseButton onClick={() => setNoteCollapsed((prev) => !prev)}>
              <svg
                fill="red"
                height="200px"
                width="200px"
                version="1.1"
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 511.735 511.735"
                stroke="red"
                strokeWidth="2.2"
                style={{
                  transform: isNoteCollapsed
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <g>
                    {" "}
                    <g>
                      {" "}
                      <path d="M508.788,371.087L263.455,125.753c-4.16-4.16-10.88-4.16-15.04,0L2.975,371.087c-4.053,4.267-3.947,10.987,0.213,15.04 c4.16,3.947,10.667,3.947,14.827,0l237.867-237.76l237.76,237.76c4.267,4.053,10.987,3.947,15.04-0.213 C512.734,381.753,512.734,375.247,508.788,371.087z"></path>{" "}
                    </g>{" "}
                  </g>{" "}
                </g>
              </svg>
            </CollapseButton>
          </TerminalFooter>
        </TerminalContainer>
        {showOptions && (
          <div
            className={`options-container ${
              showOptions ? "fade-in" : "fade-out"
            }`}
            ref={optionsMenuRef}
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
              <FooterAction onClick={lock}>
                {isNoteLocked && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
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
                        stroke="#000000"
                        strokeWidth="1.5"
                      ></path>{" "}
                      <path
                        d="M12 14V18"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                      <path
                        d="M6 10V8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8V10"
                        stroke="#000000"
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
                    style={{
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
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
                        stroke="#000000"
                        strokeWidth="1.5"
                      ></path>{" "}
                      <path
                        d="M6 10V8C6 4.68629 8.68629 2 12 2C14.7958 2 17.1449 3.91216 17.811 6.5"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                      <path
                        d="M12 14V18"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>{" "}
                    </g>
                  </svg>
                )}
              </FooterAction>

              {isShareButtonVisible && (
                <FooterAction>
                  <svg
                    onClick={ShareNotes}
                    viewBox="0 0 24.00 24.00"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
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
                        d="M20 13L20 18C20 19.1046 19.1046 20 18 20L6 20C4.89543 20 4 19.1046 4 18L4 13"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M16 8L12 4M12 4L8 8M12 4L12 16"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </FooterAction>
              )}

              {showReminderOption && (
                <button
                  onClick={async () => {
                    const remiderData = getReminderTime(content);
                    if (remiderData !== undefined) {
                      await addTimer(
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
