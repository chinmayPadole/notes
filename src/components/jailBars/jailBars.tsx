// src/JailBars.js
import React from "react";
import "./jailBars.css";

export const JailBars: React.FC<{ showBars: boolean }> = ({ showBars }) => {
  return (
    <>
      {showBars && (
        <div className="rectangle">
          <div className="jail-bars">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bar" />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
