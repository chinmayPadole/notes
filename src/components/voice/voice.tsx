// src/FloatingButton.js

import React, { useEffect, useRef, useState } from "react";
import "./voice.css";
import { useToast } from "../../provider/toastProvider";

export const Voice: React.FC<{
  setTranscript: (transcript: string) => void;
  setVoice: (isVoiceOn: boolean) => void;
}> = ({ setTranscript, setVoice }) => {
  const { showToast } = useToast();

  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const requestMicrophonePermission = () => {
    try {
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          setHasPermission(true);
          window.localStream = stream; // A
          window.localAudio.srcObject = stream; // B
          window.localAudio.autoplay = true; // C
          // You can now use the stream object to access the microphone
          console.log("Microphone stream:", stream);
        });
    } catch (err) {
      showToast("microphone permission denied", "red", 3000);
      setHasPermission(false);
      console.error("Error accessing microphone:", err);
    }
  };

  useEffect(() => {
    if (hasPermission === false) {
      requestMicrophonePermission();
    }
  }, [hasPermission]);

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
    requestMicrophonePermission();
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
