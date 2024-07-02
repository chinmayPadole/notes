import React, { useState, useRef, useEffect } from "react";
import "./collapsibleStyle.css";

interface CollapsibleTextAreaProps {
  text: string;
  maxLines: number;
}

export const CollapsibleTextArea: React.FC<CollapsibleTextAreaProps> = ({
  text,
  maxLines,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(textAreaRef.current).lineHeight || "0"
      );
      const maxHeight = lineHeight * maxLines;
      setIsOverflowing(textAreaRef.current.scrollHeight > maxHeight);
    }
  }, [text, maxLines]);

  const createLinkifiedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        const url = part.startsWith("http") ? part : `http://${part}`;
        return (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };
  return (
    <div>
      <div
        ref={textAreaRef}
        style={{
          maxHeight: isExpanded ? "none" : `${maxLines * 1.5}em`,
          overflow: "hidden",
        }}
      >
        {createLinkifiedText(text)}
      </div>
      {isOverflowing && (
        <button
          className="collapsibleBtn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less..." : "Show more..."}
        </button>
      )}
    </div>
  );
};
