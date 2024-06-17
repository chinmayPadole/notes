import React, { useEffect, useRef, useState } from "react";
import "./floatingMenu.css";
import { useSecurity } from "../../provider/securityProvider";
import { Legend } from "../legend/legend";
import { useToast } from "../../provider/toastProvider";
import { Reminders } from "../reminders/upcomingReminders";
import { GenerateQRCode } from "../qrcode/qrcode";

export const FloatingMenu: React.FC<{
  setTranscript: (transcript: string) => void;
  setVoice: (isVoiceOn: boolean) => void;
  setNoteEditorOpen: (openNoteEditor: boolean) => void;
}> = ({ setTranscript, setVoice, setNoteEditorOpen }) => {
  const { showToast } = useToast();
  const [isMenuOpen, setMenuVisibility] = useState(false);
  const [isQRCodeVisible, setQRCodeVisibility] = useState(false);
  const { isLocked, toggleLock } = useSecurity();

  /* Voice Region */
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestMicrophonePermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setHasPermission(true);
        if (streamRef.current) {
          streamRef.current = stream; // A
        }
        // window.localAudio.srcObject = stream; // B
        // window.localAudio.autoplay = true; // C
        // You can now use the stream object to access the microphone

        if (audioRef.current) {
          audioRef.current.srcObject = stream;
          audioRef.current.autoplay = true;
        }
      })
      .catch((error) => {
        showToast("microphone permission denied", "#6a040f", 3000, "error");
        setHasPermission(false);
        console.error("Error accessing microphone:", error);
      });
  };

  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setHasPermission(true);
        // Remember to stop the tracks to release the microphone
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.log(error);
        setHasPermission(false);
      }
    };

    requestMicrophonePermission();
  }, []);

  // useEffect(() => {
  //   if (hasPermission === false) {
  //     requestMicrophonePermission();
  //   }
  // }, [hasPermission]);

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
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const lastResultIndex = event.results.length - 1;
      const speechResult = event.results[lastResultIndex][0].transcript;
      setTranscript(speechResult);
    };

    recognition.onstart = () => {
      setVoice(true);
    };

    recognition.onend = () => {
      recognitionRef.current.stop();
      setVoice(false);
      setIsListening(false);
      handleStopListening();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleStartListening = () => {
    if (!hasPermission) {
      requestMicrophonePermission();
    }
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setIsListening(false);
      setHasPermission(false);
    }

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  };
  /* Voice Region End*/

  /* Legend Region */
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  /* Legend Region End */

  return (
    <>
      <div className="floatingMenu-container">
        <label
          className="floatingMenu-button"
          style={{ paddingRight: isMenuOpen ? "10px" : "30px" }}
          onClick={() => setMenuVisibility(!isMenuOpen)}
        >
          <span className={isMenuOpen ? "x-icon icon1" : "x-icon"}></span>
          <span className={isMenuOpen ? "x-icon icon2" : "x-icon"}></span>
          {isMenuOpen && (
            <nav className={isMenuOpen ? "nav" : "hiddenMenu"}>
              <ul>
                <li
                  onClick={() =>
                    isListening ? handleStopListening() : handleStartListening()
                  }
                >
                  <a href="#0">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M12 17V21M12 21H9M12 21H15"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <rect
                          x="10"
                          y="3"
                          width="4"
                          height="10"
                          rx="2"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></rect>{" "}
                        <path
                          d="M17.7378 12.7542C17.3674 13.9659 16.6228 15.0293 15.6109 15.7918C14.599 16.5544 13.3716 16.977 12.1047 16.9991C10.8378 17.0212 9.59647 16.6417 8.55854 15.9149C7.52061 15.1881 6.73941 14.1515 6.32689 12.9534"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </a>
                </li>
                <li onClick={() => setNoteEditorOpen(true)}>
                  <a>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="#eeff00"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M16 3.98999H8C6.93913 3.98999 5.92178 4.41135 5.17163 5.1615C4.42149 5.91164 4 6.92912 4 7.98999V17.99C4 19.0509 4.42149 20.0682 5.17163 20.8184C5.92178 21.5685 6.93913 21.99 8 21.99H16C17.0609 21.99 18.0783 21.5685 18.8284 20.8184C19.5786 20.0682 20 19.0509 20 17.99V7.98999C20 6.92912 19.5786 5.91164 18.8284 5.1615C18.0783 4.41135 17.0609 3.98999 16 3.98999Z"
                          stroke="#eeff00"
                          strokeWidth="1.032"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M9 2V7"
                          stroke="#eeff00"
                          strokeWidth="1.032"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M15 2V7"
                          stroke="#eeff00"
                          strokeWidth="1.032"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M8 16H14"
                          stroke="#eeff00"
                          strokeWidth="1.032"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M8 12H16"
                          stroke="#eeff00"
                          strokeWidth="1.032"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </a>
                </li>
                <li onClick={() => toggleLock(!isLocked)}>
                  <a>
                    {isLocked && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#eeff00"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                            stroke="#eeff00"
                            strokeWidth="0.9600000000000002"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                        </g>
                      </svg>
                    )}
                    {!isLocked && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="#eeff00"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            d="M16.584 6C15.8124 4.2341 14.0503 3 12 3C9.23858 3 7 5.23858 7 8V10.0288M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C16.8802 10 17.7202 10 18.362 10.327C18.9265 10.6146 19.3854 11.0735 19.673 11.638C20 12.2798 20 13.1198 20 14.8V16.2C20 17.8802 20 18.7202 19.673 19.362C19.3854 19.9265 18.9265 20.3854 18.362 20.673C17.7202 21 16.8802 21 15.2 21H8.8C7.11984 21 6.27976 21 5.63803 20.673C5.07354 20.3854 4.6146 19.9265 4.32698 19.362C4 18.7202 4 17.8802 4 16.2V14.8C4 13.1198 4 12.2798 4.32698 11.638C4.6146 11.0735 5.07354 10.6146 5.63803 10.327C5.99429 10.1455 6.41168 10.0647 7 10.0288Z"
                            stroke="#eeff00"
                            strokeWidth="0.9600000000000002"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                        </g>
                      </svg>
                    )}
                  </a>
                </li>
                <li onClick={() => setIsLegendOpen(true)}>
                  <a>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M12 19H12.01M8.21704 7.69689C8.75753 6.12753 10.2471 5 12 5C14.2091 5 16 6.79086 16 9C16 10.6565 14.9931 12.0778 13.558 12.6852C12.8172 12.9988 12.4468 13.1556 12.3172 13.2767C12.1629 13.4209 12.1336 13.4651 12.061 13.6634C12 13.8299 12 14.0866 12 14.6L12 16"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </a>
                </li>

                <li onClick={() => setIsReminderOpen(true)}>
                  <a>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="#eeff00"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M12 9V13L14.5 15.5"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M3.5 4.5L7.50002 2"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M20.5 4.5L16.5 2"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                        <path
                          d="M7.5 5.20404C8.82378 4.43827 10.3607 4 12 4C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 11.3607 3.43827 9.82378 4.20404 8.5"
                          stroke="#eeff00"
                          strokeWidth="0.9600000000000002"
                          strokeLinecap="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </a>
                </li>
                <li onClick={() => setQRCodeVisibility(true)}>
                  <a>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="#000000"
                      strokeWidth="1.032"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M14.3935 5.37371C18.0253 6.70569 19.8979 10.7522 18.5761 14.4118C17.6363 17.0135 15.335 18.7193 12.778 19.0094M12.778 19.0094L13.8253 17.2553M12.778 19.0094L14.4889 20M9.60651 18.6263C5.97465 17.2943 4.10205 13.2478 5.42394 9.58823C6.36371 6.98651 8.66504 5.28075 11.222 4.99059M11.222 4.99059L10.1747 6.74471M11.222 4.99059L9.51114 4"
                          stroke="#EEFF00"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>{" "}
                      </g>
                    </svg>
                  </a>
                </li>
              </ul>
            </nav>
          )}
        </label>
      </div>
      <Legend show={isLegendOpen} onClose={() => setIsLegendOpen(false)} />

      {isReminderOpen && (
        <Reminders
          show={isReminderOpen}
          onClose={() => setIsReminderOpen(false)}
        />
      )}

      {isQRCodeVisible && (
        <GenerateQRCode
          show={isQRCodeVisible}
          onClose={() => setQRCodeVisibility(false)}
        />
      )}
    </>
  );
};
