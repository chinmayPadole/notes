// src/FloatingButton.js

import React, { useEffect, useRef, useState } from "react";
import "./voice.css";

export const Voice: React.FC<{
  setTranscript: (transcript: string) => void;
  setVoice: (isVoiceOn: boolean) => void;
}> = ({ setTranscript, setVoice }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Browser does not support the Web Speech API");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const speechResult = event.results[lastResultIndex][0].transcript;
      setTranscript(speechResult);
    };

    recognition.onstart = () => {
      setVoice(true);
    };

    recognition.onend = () => {
      setVoice(false);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <button
      className="floating-button"
      onClick={() =>
        isListening ? handleStopListening() : handleStartListening()
      }
    >
      <div className="voice-button">
        <div className="circle"></div>
      </div>
    </button>
  );
};
