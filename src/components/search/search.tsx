// SpotlightSearch.tsx
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  max-width: 600px;
  z-index: 1000;
  display: flex;
  justify-content: center;
`;

const Input = styled.input`
  width: 80%;
  padding: 15px;
  font-size: 18px;
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

interface SearchProps {
  visible: boolean;
  setSearchText: (text: string) => void;
  onClose: (isSearchEnabled: boolean) => void;
}

export const Search: React.FC<SearchProps> = ({
  visible,
  setSearchText,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchText("");
      onClose(false);
    }
  };

  if (!visible) return null;

  return (
    <Container>
      <Input
        ref={inputRef}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
      />
    </Container>
  );
};
