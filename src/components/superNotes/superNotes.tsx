import React, { useState, useEffect } from "react";
import styled from "styled-components";
import "./superNotes.css";
import { Board } from "../board/board";

const Container = styled.div`
  position: relative;
  background: #fff;
`;

const StaticElement = styled.div<{ isFixed: boolean }>`
  position: ${(props) => (props.isFixed ? "relative" : "fixed")};
  top: ${(props) => (props.isFixed ? "0" : "auto")};
  // bottom: ${(props) => (props.isFixed ? "auto" : "0")};
  left: 0;
  width: 100%;
  height: 100px; /* Adjust height as needed */
  background-color: #fff; /* Set background color as needed */
  z-index: 1; /* Set a higher z-index than other elements */
  transition: position 0.3s ease-in-out; /* Smooth transition */
`;

export const SuperNotes: React.FC = () => {
  const [isFixed, setIsFixed] = useState<boolean>(true);
  const [isSearchMode, setSearchMode] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const initialOffset = 100; // Adjust as needed
      setIsFixed(scrollPos <= initialOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchMode(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Container>
      <StaticElement isFixed={isFixed}>
        <div className="panel">
          <h1 className="jj">
            <span>Super</span>
            <span>Notes</span>
          </h1>
          <h1 className="jj">
            <span>Super</span>
            <span>Notes</span>
          </h1>
          <button className="searchBtn" onClick={() => setSearchMode(true)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#ffffff"
              transform="matrix(1, 0, 0, 1, 0, 0)"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                  stroke="#ffffff"
                  stroke-width="0.696"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>{" "}
              </g>
            </svg>
          </button>
        </div>
      </StaticElement>
      <div className="board">
        <Board isSearchMode={isSearchMode} setSearchMode={setSearchMode} />
      </div>
    </Container>
  );
};
