import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { GetAllNotes } from "../../common/glanceHelper";

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
        : "10vh"
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
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border: 1px solid #fff;
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

const MetaNotesWrapper = styled.div`
  color: white;
  overflow: scroll;
  height: 340px;
`;
const MetaNote = styled.div`
  padding: 10px;
  border: 1px solid;
  border-radius: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  margin: 10px 10px;
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
  width: 275px;
`;

export const QuickView: React.FC = () => {
  const [isExpanded, setExpanded] = useState<boolean>(false);
  const [selectedAction, setSelectedAction] = useState<number>(0);

  const highlightNote = (noteId: string) => {
    console.log(noteId);
  };

  useEffect(() => {
    if (isExpanded === false) {
      setSelectedAction(0);
    }
  }, [isExpanded]);

  const getDisplayNotes = () => {
    console.log(GetAllNotes());
    const notes = GetAllNotes();
    return notes.map((note) => {
      return (
        <MetaNote key={note.id} onClick={() => highlightNote(note.id)}>
          <NoteHeader>{note.title}</NoteHeader>
          <NoteBody>{note.content}</NoteBody>
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
            <QuickAction
              style={{ background: selectedAction === 1 ? "red" : "inherit" }}
              onClick={() => setSelectedAction((prev) => (prev === 1 ? 0 : 1))}
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
              <span>10+ incomplete tasks</span>
            </QuickAction>
            <QuickAction
              style={{ background: selectedAction === 2 ? "red" : "inherit" }}
              onClick={() => setSelectedAction((prev) => (prev === 2 ? 0 : 2))}
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
              <span>10+ reminders due</span>
            </QuickAction>
            <QuickAction
              style={{ background: selectedAction === 3 ? "red" : "inherit" }}
              onClick={() => setSelectedAction((prev) => (prev === 3 ? 0 : 3))}
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
          </QuickActionsWrapper>
          {selectedAction > 0 && (
            <>
              <Divider />
              <MetaNotesWrapper>{getDisplayNotes()}</MetaNotesWrapper>
            </>
          )}
        </QuickContent>
      )}
    </QuickViewContainer>
  );
};
