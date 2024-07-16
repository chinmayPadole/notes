import React, { useEffect, useRef, useState } from "react";
import "./note.css";
import { getFormattedDate, maskString } from "../../common/utils";
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

const TerminalContainer = styled.div<{
  $bgcolor: string;
  $fontcolor: string;
}>`
  background-color: ${(props) => props.$bgcolor};
  color: ${(props) => props.$fontcolor};

  border-radius: 10px;
  box-shadow: 2px 4px 12px #00000014;
  // width: max-content;
  // max-width: 800px;
  min-width: max(350px, calc(100vw - 100px));
  max-width: max(350px, calc(100vw - 100px));
  word-wrap: break-word;
  position: relative;
`;

const TerminalHeader = styled.div<{
  $headercolor: string;
}>`
  background-color: ${(props) => props.$headercolor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  @media (max-width: 500px) {
    align-items: center;
    flex-direction: column;
  }
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
  border-radius: 50%;
  margin: 0 5px;
`;

const TerminalBody = styled.div`
  padding: 20px;
  letter-spacing: 0.007em !important;
  white-space: pre-wrap;
  position: relative;
  word-break: break-word;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

const NoteContainer = styled.div`
  padding-top: 10px;
  transition: border 0.4s linear;
  border-radius: 10px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px 10px 0 0;
  min-width: 340px;

  /*Prevent text selection*/
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                supported by Chrome, Edge, Opera and Firefox */
`;

const NoteTitleWrapper = styled.div`
  width: 95%;
  align-items: center;
  padding: 8px;
  margin-right: 20px;
  display: flex;
  justify-content: end;

  & svg {
    max-width: 20px;
    max-height: 20px;
  }

  @media (max-width: 500px) {
    justify-content: center;
    padding-top: 0;
    margin-top: -5px;
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

  @media (max-width: 500px) {
    text-align: left;
  }
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
}): JSX.Element => {
  const { showToast } = useToast();
  const [noteTitle, setNoteTitle] = useState<string | null>(title);

  const [formattedContent, setFormattedContent] = useState<string>(content);
  const [colorSet, setActiveColorSet] = useState<{
    noteHeader: string;
    fontColor: string;
    noteBackground: string;
  }>(ColorSet["white"]);

  useEffect(() => {
    setActiveColorSet(ColorSet[color]);
  }, [color]);

  const [isFadingOut, setIsFadingOut] = useState(false);

  const { isLocked: isPageLocked } = useSecurity();
  const [showReminderOption, setReminderOption] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const { addTimer } = useTimerManager();

  const [isPressing, setIsPressing] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const timerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (isPressing) {
      timerRef.current = window.setTimeout(() => {
        setIsLongPress(true);
        setIsDatePickerOpen(true);
      }, 1500); // Adjust the time to your need (1000ms = 1s)
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setIsLongPress(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPressing]);

  const handleMouseDown = () => {
    setIsPressing(true);
  };

  const handleMouseUp = () => {
    setIsPressing(false);
  };

  const handleMouseLeave = () => {
    setIsPressing(false);
  };

  const fadeOut = (cb: NodeJS.Timeout) => {
    setIsFadingOut(true);
  };

  const handleRemoveItem = () => {
    removeNote(id);
    setIsFadingOut(false);
    setReminderOption(false);
    setReminderText("");
    setActiveColorSet(ColorSet["white"]);
  };

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
    updateNote(id, content, color, !isNoteLocked, noteTitle);
    showToast(isNoteLocked ? "locked" : "unlocked", "#333", 3000);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const updateNoteColor = (color: string) => {
    setActiveColorSet(ColorSet[color]);
    updateNote(id, content, color, isNoteLocked, noteTitle);
  };

  const getColorPaletteItems = () => {
    return Object.entries(ColorSet).map(([key, value], index) => {
      return (
        <div
          key={index}
          className="palettecircle"
          onClick={() => updateNoteColor(key)}
        >
          <div
            className="left-half"
            style={{ background: value.noteHeader }}
          ></div>
          <div
            className="right-half"
            style={{ background: value.noteBackground }}
          ></div>
        </div>
      );
    });
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
      updateNote(id, content, color, isNoteLocked, noteTitle);
    }
  }, [noteTitle]);

  const handleInput = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e);
    if (
      e.currentTarget.innerText.length > 30 &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
      e.currentTarget.innerText.slice(0, 30);
    }
  };

  return (
    <>
      <NoteContainer
        ref={noteRef}
        className={`long-press-button ${isLongPress ? "long-press" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
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
              <Dot
                color="#ff5f56"
                onClick={() =>
                  fadeOut(setTimeout(() => handleRemoveItem(), 300))
                }
              />
              <Dot color="#27c93f" onClick={copy} />
              <Dot color="#0A20FF" onClick={lock} />
              <Dot color="#FF9500" onClick={toggleOptions} />
              <DateElement>{getFormattedDate(createDt)}</DateElement>
            </HeaderActions>
            <NoteTitleWrapper>
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
                    titleRef.current.innerHTML.length === 0
                  ) {
                    titleRef.current.innerHTML = "new note";
                  } else if (
                    titleRef.current &&
                    titleRef.current.innerHTML.length > 0
                  ) {
                    setNoteTitle(titleRef.current.innerHTML);
                  }
                }}
                suppressContentEditableWarning={true}
              >
                {title === null ? "new note" : title}
              </NoteTitle>
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
              });
            }}
          >
            {!isImage && (
              <CollapsibleTextArea text={formattedContent} maxLines={3} />
            )}
            {isImage && (
              <CollapsibleImage
                src={formattedContent}
                alt="Content Corrupted 😔"
                maxHeight={200}
              />
            )}
          </TerminalBody>
        </TerminalContainer>
        {showOptions && (
          <div
            className={`options-container ${
              showOptions ? "fade-in" : "fade-out"
            }`}
          >
            <button
              className="close-button"
              onClick={() => setShowOptions(false)}
            >
              ×
            </button>
            <div className="options-content">
              <div className="colorPalettes-container">
                {getColorPaletteItems()}
              </div>
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
