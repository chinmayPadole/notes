import React, { useEffect, useState } from "react";
import "./note.css";
import { getFormattedDate, isValidImage, maskString } from "../../common/utils";
import { ColorSet } from "../../common/colorSet";
import styled from "styled-components";
import { useToast } from "../../provider/toastProvider";
import { UpdateNote } from "../newNote/UpdateNote";
import { useSecurity } from "../../provider/securityProvider";
import { NoteProps } from "./NoteProps";
import { isReminderPossible, getReminderTime } from "../../common/remider";
import { useTimerManager } from "../../service/useTimeManager";

const TerminalContainer = styled.div<{
  bgColor: string;
  fontColor: string;
}>`
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.fontColor};

  border-radius: 10px;
  box-shadow: 2px 4px 12px #00000014;
  // width: max-content;
  // max-width: 800px;
  min-width: max(350px, calc(100vw - 100px));
  max-width: max(350px, calc(100vw - 100px));
  word-wrap: break-word;
  overflow: auto;
  position: relative;
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

export const Dot = styled.div`
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
  font-size: 18px !important;
  letter-spacing: 0.007em !important;
  white-space: pre-wrap;
  position: relative;
  word-break: break-word;
`;

const NoteContainer = styled.div`
  padding-top: 10px;
`;

export const Note: React.FC<NoteProps> = ({
  createDt,
  content,
  color,
  id,
  removeNote,
  updateNote,
  isNoteLocked,
  toggleNoteUpdateMode,
}): JSX.Element => {
  const { showToast } = useToast();
  const [isNoteUpdatorOpen, toggleNoteEditor] = useState<boolean>(false);
  const [formattedContent, setFormattedContent] = useState<string>(content);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [colorSet, setActiveColorSet] = useState<{
    noteHeader: string;
    fontColor: string;
    noteBackground: string;
  }>(ColorSet["white"]);

  useEffect(() => {
    setActiveColorSet(ColorSet[color]);
  }, [color]);

  const [isLocked, toggleLock] = useState<boolean | null>(null);

  const [isFadingOut, setIsFadingOut] = useState(false);

  const { isLocked: isPageLocked } = useSecurity();

  const [showSummaryOption, setSummaryOption] = useState(false);
  const [showReminderOption, setReminderOption] = useState(false);
  const [reminderText, setReminderText] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const { timers, addTimer } = useTimerManager();

  const fadeOut = (cb: NodeJS.Timeout) => {
    setIsFadingOut(true);
  };

  const handleRemoveItem = () => {
    removeNote(id);
    setIsImage(false);
    setIsFadingOut(false);
    setSummaryOption(false);
    setReminderOption(false);
    setReminderText("");
    setActiveColorSet(ColorSet["white"]);
    toggleNoteUpdateMode(false);
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

  useEffect(() => {
    if (content.length > 180) {
      setSummaryOption(true);
    }
    const reminderText = isReminderPossible(content);
    if (reminderText !== null) {
      setReminderText(reminderText);
      setReminderOption(true);
    }
  }, [content, showOptions]);

  const copy = () => {
    navigator.clipboard.writeText(content);
    showToast("copied", "black", 3000);
  };

  const lock = () => {
    toggleLock(!isLocked);
    showToast(isLocked ? "locked" : "unlocked", "black", 3000);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const updateNoteColor = (color: string) => {
    setActiveColorSet(ColorSet[color]);
    updateNote(id, content, color, isNoteLocked);
  };

  const getColorPaletteItems = () => {
    return Object.entries(ColorSet).map(([key, value]) => {
      return (
        <div className="palettecircle" onClick={() => updateNoteColor(key)}>
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
    if (!isNoteUpdatorOpen) {
      toggleNoteUpdateMode(false);
    }
  }, [isNoteUpdatorOpen]);

  return (
    <>
      <NoteContainer>
        <TerminalContainer
          bgColor={colorSet.noteBackground}
          fontColor={colorSet.fontColor}
          className={isFadingOut ? "item-fadeout" : "item"}
        >
          <TerminalHeader headerColor={colorSet.noteHeader}>
            <Dot
              color="#ff5f56"
              onClick={() => fadeOut(setTimeout(() => handleRemoveItem(), 300))}
            />
            <Dot color="#27c93f" onClick={copy} />
            <Dot color="#0A20FF" onClick={lock} />
            <Dot color="#FF9500" onClick={toggleOptions} />
            <Date>{getFormattedDate(createDt)}</Date>
            {/* <Dot color="#ffbd2e" />
             */}
          </TerminalHeader>
          <TerminalBody
            onDoubleClick={() => {
              toggleNoteEditor(true);
              toggleNoteUpdateMode(true);
            }}
          >
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
                        remiderData.reminderText
                      ); // 5 seconds timer
                    }
                    setShowOptions(false);
                    showToast(`reminder set ${reminderText}`, "black", 3000);
                  }}
                >
                  <p>set reminder {reminderText}?</p>
                </button>
              )}
              {showSummaryOption && (
                <button>
                  <p>summarize ?</p>
                </button>
              )}
            </div>
          </div>
        )}
      </NoteContainer>
      {isNoteUpdatorOpen && (
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
