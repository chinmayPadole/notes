import React, { useState } from "react";
import "./wave.css";

export const Wave: React.FC<{ showWave: boolean }> = ({ showWave }) => {
  return (
    <div className="App">
      {showWave && (
        <div className="overlay">
          <div className="sound-icon disabled">
            <div className="sound-wave">
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
              <i className="bar"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
