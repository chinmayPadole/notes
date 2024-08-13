import React, { useState } from "react";
import "./wave.css";

export const Wave: React.FC<{
  showWave: boolean;
  setVoice: (isVoiceOn: boolean) => void;
  transcript: string;
}> = ({ showWave, setVoice, transcript }) => {
  return (
    <div className="App">
      {showWave && (
        <div className="overlay">
          <div className="transcriptVoice">{transcript}</div>
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
          <button className="stopBtn" onClick={() => setVoice(false)} />
        </div>
      )}
    </div>
  );
};
