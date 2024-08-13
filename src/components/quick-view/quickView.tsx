import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { GetAllNotes } from "../../common/glanceHelper";
import "./quickView.css";

const QuickViewContainer = styled.div<{
  $isexpanded: string;
  $actionselected: string;
}>`
  width: 100%;
  height: ;

  position: fixed;
  bottom: 0;
  background: radial-gradient(circle, #0e0e0e 15%, #010101);
  display: grid;
  align-items: center;
  justify-items: center;
  grid-template-rows: ${({ $isexpanded }) =>
    $isexpanded === "true" ? "40px auto" : "auto"};

  height: ${({ $isexpanded, $actionselected }) =>
    $isexpanded === "true"
      ? $actionselected === "true"
        ? "60vh"
        : "12.5vh"
      : "calc(25vh - 170px)"};
  transition: height 0.3s ease-in-out;

  @media (max-width: 500px) {
    height: ${({ $isexpanded, $actionselected }) =>
      $isexpanded === "true"
        ? $actionselected === "true"
          ? "60vh"
          : "16vh"
        : "calc(25vh - 170px)"};
  }
`;

const DragBar = styled.div`
  width: 137px;
  height: 23px;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1px solid #fff;

  background: linear-gradient(
    214deg,
    #4285f4 0,
    #9b72cb 16%,
    #d96570 20%,
    #d96570 28%,
    #9b72cb 53%,
    #4285f2 73%,
    #9b72cb 78%,
    #d96570 100%
  );
`;

const QuickContent = styled.div`
  width: 100%;
  padding-top: 20px;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 5px;
  color: white;
  height: 100%;
`;

const QuickActionsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap-reverse;
  gap: 10px;
  padding: 0 10px;
`;

const EmptyText = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 10px;
  font-size: xxx-large;
  color: #4b4b4b;
  font-weight: 700;
`;

const QuickAction = styled.div`
  display: flex;
  width: max-content;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;

  border: 1px solid;
  border-radius: 5px;
  padding: 5px;
  cursor: pointer;

  & svg {
    width: 20px;
    height: 20px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #434242;
  margin: 10px 0;
`;

const QuickViewFilterOptions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  & button {
    width: 40px;
    height: 40px;
    background: transparent;
    border: 1.5px solid #e7e7e9;

    cursor: pointer;
  }
`;

const MetaNotesWrapper = styled.div`
  color: white;
  overflow-y: auto;
  height: 340px;
  width: calc(100vw - 2px);
`;
const MetaNote = styled.div`
  padding: 10px;
  border: 1px solid;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px 10px;
  max-height: calc(1.5em * 3 + 5px);
`;
const NoteHeader = styled.div`
  font-size: 18px;
`;
const NoteBody = styled.div`
  font-size: 12px;
  font-size: small;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  color: #978f8f;
`;

export const QuickView: React.FC<{
  setHighlightNote: (highlightedNote: string) => void;
}> = ({ setHighlightNote }) => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<number>(0);
  const [isGrid, setGridStyle] = useState<boolean>(true);

  const [allNotes, setAllNotes] = useState<
    {
      id: string;
      content: string;
      title: string;
    }[]
  >([]);
  const [pastDueNotes, setPastDueNotes] = useState<
    {
      id: string;
      content: string;
      title: string;
    }[]
  >([]);
  const [pendingTaskNotes, setPendingTaskNotes] = useState<
    {
      id: string;
      content: string;
      title: string;
    }[]
  >([]);

  const highlightNote = (noteId: string) => {
    setExpanded(false);
    setHighlightNote(noteId);
  };

  useEffect(() => {
    if (isExpanded === false) {
      setSelectedAction(0);
    }
  }, [isExpanded]);

  useEffect(() => {
    getDisplayNotes();
  }, []);

  const getDisplayNotes = () => {
    const [all, past, pending] = GetAllNotes();
    setAllNotes(all);
    setPastDueNotes(past);
    setPendingTaskNotes(pending);
    //setNoteCount(notes.length > 10 ? "10+" : `${notes.length}`);
  };

  const getNoteJSX = () => {
    const data: {
      id: string;
      content: string;
      title: string;
    }[] =
      selectedAction === 3
        ? allNotes
        : selectedAction === 2
        ? pastDueNotes
        : selectedAction === 1
        ? pendingTaskNotes
        : [];
    return data.map((note, i) => {
      return (
        <MetaNote
          style={{ background: i % 2 === 0 ? "#2d2d2d" : "inherit" }}
          key={note.id}
          onClick={() => highlightNote(note.id)}
        >
          <NoteHeader>{note.title}</NoteHeader>
          <NoteBody className={isGrid ? "grid-view-content-style" : ""}>
            {note.content}
          </NoteBody>
        </MetaNote>
      );
    });
  };

  return (
    <QuickViewContainer
      $actionselected={selectedAction > 0 ? "true" : "false"}
      $isexpanded={isExpanded ? "true" : "false"}
    >
      <DragBar
        className="selection-prevention"
        onClick={() => setExpanded((prev) => !prev)}
      >
        At a Glance
      </DragBar>
      {isExpanded && (
        <QuickContent>
          <QuickActionsWrapper>
            {pendingTaskNotes.length === 0 &&
              allNotes.length === 0 &&
              pastDueNotes.length === 0 && <EmptyText>start noting!</EmptyText>}
            {pendingTaskNotes.length > 0 && (
              <QuickAction
                style={{ background: selectedAction === 1 ? "red" : "inherit" }}
                onClick={() =>
                  setSelectedAction((prev) => (prev === 1 ? 0 : 1))
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
                      opacity="0.4"
                      d="M11 19.5H21"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      opacity="0.4"
                      d="M11 12.5H21"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      opacity="0.4"
                      d="M11 5.5H21"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M3 5.5L4 6.5L7 3.5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M3 12.5L4 13.5L7 10.5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M3 19.5L4 20.5L7 17.5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
                <span>
                  {pendingTaskNotes.length > 10
                    ? "10+"
                    : `${pendingTaskNotes.length}`}{" "}
                  incomplete tasks
                </span>
              </QuickAction>
            )}
            {pastDueNotes.length > 0 && (
              <QuickAction
                style={{ background: selectedAction === 2 ? "red" : "inherit" }}
                onClick={() =>
                  setSelectedAction((prev) => (prev === 2 ? 0 : 2))
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
                      d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      opacity="0.4"
                      d="M15.7099 15.1798L12.6099 13.3298C12.0699 13.0098 11.6299 12.2398 11.6299 11.6098V7.50977"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
                <span>
                  {pastDueNotes.length > 10 ? "10+" : `${pastDueNotes.length}`}{" "}
                  reminders due
                </span>
              </QuickAction>
            )}
            {allNotes.length > 0 && (
              <QuickAction
                style={{ background: selectedAction === 3 ? "red" : "inherit" }}
                onClick={() =>
                  setSelectedAction((prev) => (prev === 3 ? 0 : 3))
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
                    <g opacity="0.4">
                      {" "}
                      <path
                        d="M12.0605 16.5V11.5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M14.5 14H9.5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>{" "}
                    <path
                      d="M22 11V17C22 21 21 22 17 22H7C3 22 2 21 2 17V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11Z"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                    ></path>{" "}
                  </g>
                </svg>
                <span>browse notes</span>
              </QuickAction>
            )}
          </QuickActionsWrapper>
          {selectedAction > 0 && (
            <>
              <Divider />
              <QuickViewFilterOptions>
                <button
                  style={{
                    borderTopLeftRadius: "8px",
                    borderBottomLeftRadius: "8px",
                    background: !isGrid ? "#c5c5c5" : "inherit",
                  }}
                  onClick={() => setGridStyle(false)}
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
                        d="M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
                        stroke="#ff0000"
                        strokeWidth="0.9600000000000002"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </button>
                <button
                  style={{
                    borderTopRightRadius: "8px",
                    borderBottomRightRadius: "8px",
                    background: isGrid ? "#c5c5c5" : "inherit",
                  }}
                  onClick={() => setGridStyle(true)}
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
                        d="M14 5.6C14 5.03995 14 4.75992 14.109 4.54601C14.2049 4.35785 14.3578 4.20487 14.546 4.10899C14.7599 4 15.0399 4 15.6 4H18.4C18.9601 4 19.2401 4 19.454 4.10899C19.6422 4.20487 19.7951 4.35785 19.891 4.54601C20 4.75992 20 5.03995 20 5.6V8.4C20 8.96005 20 9.24008 19.891 9.45399C19.7951 9.64215 19.6422 9.79513 19.454 9.89101C19.2401 10 18.9601 10 18.4 10H15.6C15.0399 10 14.7599 10 14.546 9.89101C14.3578 9.79513 14.2049 9.64215 14.109 9.45399C14 9.24008 14 8.96005 14 8.4V5.6Z"
                        stroke="#ff0000"
                        strokeWidth="0.9600000000000002"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M4 5.6C4 5.03995 4 4.75992 4.10899 4.54601C4.20487 4.35785 4.35785 4.20487 4.54601 4.10899C4.75992 4 5.03995 4 5.6 4H8.4C8.96005 4 9.24008 4 9.45399 4.10899C9.64215 4.20487 9.79513 4.35785 9.89101 4.54601C10 4.75992 10 5.03995 10 5.6V8.4C10 8.96005 10 9.24008 9.89101 9.45399C9.79513 9.64215 9.64215 9.79513 9.45399 9.89101C9.24008 10 8.96005 10 8.4 10H5.6C5.03995 10 4.75992 10 4.54601 9.89101C4.35785 9.79513 4.20487 9.64215 4.10899 9.45399C4 9.24008 4 8.96005 4 8.4V5.6Z"
                        stroke="#ff0000"
                        strokeWidth="0.9600000000000002"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M4 15.6C4 15.0399 4 14.7599 4.10899 14.546C4.20487 14.3578 4.35785 14.2049 4.54601 14.109C4.75992 14 5.03995 14 5.6 14H8.4C8.96005 14 9.24008 14 9.45399 14.109C9.64215 14.2049 9.79513 14.3578 9.89101 14.546C10 14.7599 10 15.0399 10 15.6V18.4C10 18.9601 10 19.2401 9.89101 19.454C9.79513 19.6422 9.64215 19.7951 9.45399 19.891C9.24008 20 8.96005 20 8.4 20H5.6C5.03995 20 4.75992 20 4.54601 19.891C4.35785 19.7951 4.20487 19.6422 4.10899 19.454C4 19.2401 4 18.9601 4 18.4V15.6Z"
                        stroke="#ff0000"
                        strokeWidth="0.9600000000000002"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M14 15.6C14 15.0399 14 14.7599 14.109 14.546C14.2049 14.3578 14.3578 14.2049 14.546 14.109C14.7599 14 15.0399 14 15.6 14H18.4C18.9601 14 19.2401 14 19.454 14.109C19.6422 14.2049 19.7951 14.3578 19.891 14.546C20 14.7599 20 15.0399 20 15.6V18.4C20 18.9601 20 19.2401 19.891 19.454C19.7951 19.6422 19.6422 19.7951 19.454 19.891C19.2401 20 18.9601 20 18.4 20H15.6C15.0399 20 14.7599 20 14.546 19.891C14.3578 19.7951 14.2049 19.6422 14.109 19.454C14 19.2401 14 18.9601 14 18.4V15.6Z"
                        stroke="#ff0000"
                        strokeWidth="0.9600000000000002"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </button>
              </QuickViewFilterOptions>
              <MetaNotesWrapper
                className={isGrid ? "quick-view-grid-style" : ""}
              >
                {getNoteJSX()}
              </MetaNotesWrapper>
            </>
          )}
        </QuickContent>
      )}
    </QuickViewContainer>
  );
};
