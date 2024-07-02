import React, { useState } from "react";
import "./collapsibleStyle.css";

interface CollapsibleImageProps {
  src: string;
  alt: string;
  maxHeight: number;
}

export const CollapsibleImage: React.FC<CollapsibleImageProps> = ({
  src,
  alt,
  maxHeight,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <div
        className="imageWrapper"
        style={{
          maxHeight: isExpanded ? "none" : `${maxHeight}px`,
          overflow: "hidden",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <button
        className="collapsibleBtn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Show less..." : "Show more..."}
      </button>
    </div>
  );
};
