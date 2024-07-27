import React from "react";
import styled from "styled-components";

interface TerminalTextAreaProps {
  text: string;
  textAreaRef: React.RefObject<HTMLDivElement>;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
}

const TextArea = styled.div`
  width: 100%;
  color: #c5c5c5;
  background: #1e1e1e;
  border: none;
  outline: none;
  resize: none;

  padding: 20px;
  white-space: pre-wrap;

  letter-spacing: 0.007em !important;
  line-height: 1.5; /* Adjusts line spacing */
  word-spacing: 0.2em; /* Adjusts word spacing */
  font-size: 14px;
`;

export const TerminalTextArea: React.FC<TerminalTextAreaProps> = ({
  text,
  textAreaRef,
  onKeyDown,
  onPaste,
}) => {
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

  return (
    <TextArea
      contentEditable={true}
      spellCheck={false}
      suppressContentEditableWarning={true}
      ref={textAreaRef}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    >
      {createLinkifiedText(text)}
    </TextArea>
  );
};
