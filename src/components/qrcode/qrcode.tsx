import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import styled from "styled-components";
import "./qrcode.css";
import { getUniqueId } from "../../common/utils";
import { useSocket } from "../../provider/socketProvider";
import { Scanner } from "@yudiel/react-qr-scanner";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalWrapper = styled.div`
  width: max-content;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
`;

const ModalHeader = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
`;

const ModalContent = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
`;

export const GenerateQRCode: React.FC<{
  show: boolean;
  onClose: () => void;
}> = ({ show, onClose }) => {
  const [isSessionPresent, setSessionPresent] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (sessionId === "") {
      let id = localStorage.getItem("ws_server_id");
      if (id !== null && id !== "") {
        setSessionPresent(true);
      } else {
        id = getUniqueId();
      }

      setSessionId(id);
    }
  }, []);

  const [qrCodeValue, setQRCodeValue] = useState<string>("");
  const [hostCode, setHostMode] = useState<boolean>(false);

  const [scanCode, setScanMode] = useState<boolean>(false);

  const { syncNotes, setupSocket } = useSocket();

  const triggerSync = () => {
    const notes = localStorage.getItem("notes");
    if (notes) {
      syncNotes(notes);
    }
  };

  useEffect(() => {
    if (isSessionPresent) {
      triggerSync();
    }
  }, [isSessionPresent]);

  const handleScan = async (e: string | null) => {
    if (e !== null) {
      console.log(e);
      const data = JSON.parse(e);
      setScanMode(false);
      if (data.sessionId != null && data.sessionId.trim() !== "") {
        console.log(data.sessionId);
        localStorage.setItem("ws_server_id", data.sessionId);
        setSessionPresent(true);
        // await setupSocket(data.sessionId);
      }

      //triggerSync();
    }
  };

  const createQRCode = () => {
    setQRCodeValue(JSON.stringify({ sessionId }));
    if (sessionId != null) {
      localStorage.setItem("ws_server_id", sessionId);
      console.log("SOCKET SETUP");
      setupSocket(sessionId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  return (
    <Overlay onClick={onClose}>
      <ModalWrapper onClick={(e) => e.stopPropagation()}>
        <ModalHeader>{isSessionPresent ? "" : "Scan to sync"}</ModalHeader>
        <ModalContent>
          {isSessionPresent && (
            <>
              <svg
                className="syncCheck"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 130.2 130.2"
              >
                <circle
                  className="path circle"
                  fill="none"
                  stroke="#73AF55"
                  strokeWidth="6"
                  strokeMiterlimit="10"
                  cx="65.1"
                  cy="65.1"
                  r="62.1"
                />
                <polyline
                  className="path check"
                  fill="none"
                  stroke="#73AF55"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  points="100.2,40.2 51.5,88.8 29.8,67.5 "
                />
              </svg>
            </>
          )}
          {!isSessionPresent && (
            <>
              {!scanCode && (
                <div>
                  {!hostCode && (
                    <button
                      className="qrcode-btn"
                      onClick={() => {
                        createQRCode();
                        setHostMode(true);
                        setScanMode(false);
                      }}
                    >
                      <svg
                        version="1.1"
                        id="Layer_1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 448"
                        enableBackground="new 0 0 448 448"
                        fill="#000000"
                        stroke="#000000"
                        strokeWidth="0.00448"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <g>
                            {" "}
                            <path
                              fill="#323232"
                              d="M288,0v160h160V0H288z M416,128h-96V32h96V128z"
                            ></path>{" "}
                            <rect
                              x="64"
                              y="64"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="352"
                              y="64"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <polygon
                              fill="#323232"
                              points="256,64 224,64 224,32 256,32 256,0 192,0 192,96 224,96 224,128 256,128 "
                            ></polygon>{" "}
                            <path
                              fill="#323232"
                              d="M160,160V0H0v160h32H160z M32,32h96v96H32V32z"
                            ></path>{" "}
                            <polygon
                              fill="#323232"
                              points="0,192 0,256 32,256 32,224 64,224 64,192 "
                            ></polygon>{" "}
                            <polygon
                              fill="#323232"
                              points="224,224 256,224 256,160 224,160 224,128 192,128 192,192 224,192 "
                            ></polygon>{" "}
                            <rect
                              x="352"
                              y="192"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="416"
                              y="192"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <polygon
                              fill="#323232"
                              points="320,256 320,288 352,288 352,320 384,320 384,256 352,256 352,224 320,224 320,192 288,192 288,224 256,224 256,256 "
                            ></polygon>{" "}
                            <rect
                              x="384"
                              y="224"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <path
                              fill="#323232"
                              d="M0,288v160h160V288H0z M128,416H32v-96h96V416z"
                            ></path>{" "}
                            <polygon
                              fill="#323232"
                              points="256,256 224,256 224,224 192,224 192,192 96,192 96,224 64,224 64,256 128,256 128,224 160,224 160,256 192,256 192,288 224,288 224,320 256,320 "
                            ></polygon>{" "}
                            <rect
                              x="288"
                              y="288"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="416"
                              y="256"
                              fill="#323232"
                              width="32"
                              height="64"
                            ></rect>{" "}
                            <rect
                              x="320"
                              y="320"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="384"
                              y="320"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="64"
                              y="352"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <polygon
                              fill="#323232"
                              points="320,384 320,352 288,352 288,320 256,320 256,352 224,352 224,320 192,320 192,384 224,384 224,416 256,416 256,384 "
                            ></polygon>{" "}
                            <polygon
                              fill="#323232"
                              points="352,384 320,384 320,416 352,416 352,448 384,448 384,352 352,352 "
                            ></polygon>{" "}
                            <rect
                              x="416"
                              y="352"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="192"
                              y="416"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="256"
                              y="416"
                              fill="#323232"
                              width="64"
                              height="32"
                            ></rect>{" "}
                            <rect
                              x="416"
                              y="416"
                              fill="#323232"
                              width="32"
                              height="32"
                            ></rect>{" "}
                          </g>{" "}
                        </g>
                      </svg>
                    </button>
                  )}
                  {hostCode && <QRCode size={256} value={qrCodeValue} />}
                </div>
              )}
              {!scanCode && !hostCode && <div className="divider"></div>}
              {!hostCode && (
                <div>
                  <button
                    className="qrcode-btn"
                    onClick={() => {
                      setScanMode(true);
                      setHostMode(false);
                    }}
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#000000"
                      stroke="#000000"
                      strokeWidth="0.01024"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path
                          d="M234.510695 141.605388h132.553218c12.769898 0 23.103972-10.344313 23.103972-23.103972s-10.333051-23.103972-23.103972-23.103973H234.510695c-76.441231 0-138.62281 62.18158-138.62281 138.622811v554.491241c0 76.441231 62.18158 138.62281 138.62281 138.62281h132.553218c12.769898 0 23.103972-10.345337 23.103972-23.103972 0-12.758635-10.333051-23.103972-23.103972-23.103973H234.510695c-50.967988 0-92.414866-41.458141-92.414866-92.414865V234.020254c-0.001024-50.956725 41.445854-92.414866 92.414866-92.414866zM789.000912 95.397443H656.447694c-12.769898 0-23.103972 10.344313-23.103972 23.103973s10.333051 23.103972 23.103972 23.103972h132.553218c50.967988 0 92.414866 41.458141 92.414865 92.414866v554.491241c0 50.956725-41.446878 92.414866-92.414865 92.414865H656.447694c-12.769898 0-23.103972 10.344313-23.103972 23.103973 0 12.758635 10.333051 23.103972 23.103972 23.103972h132.553218c76.441231 0 138.62281-62.18158 138.62281-138.62281V234.020254c0-76.441231-62.18158-138.62281-138.62281-138.622811z"
                          fill="#22C67F"
                        ></path>
                        <path
                          d="M731.241493 545.921321H269.166141c-19.139488 0-34.655447-15.515958-34.655446-34.655447s15.515958-34.655447 34.655446-34.655446H731.241493c19.139488 0 34.655447 15.515958 34.655447 34.655446s-15.514934 34.655447-34.655447 34.655447z"
                          fill="#74E8AE"
                        ></path>
                      </g>
                    </svg>
                  </button>
                </div>
              )}
              {scanCode && (
                // <QrReader
                //   constraints={{ facingMode: "environment" }}
                //   scanDelay={600}
                //   onResult={(result, error) => {
                //     console.log(result);
                //     if (result) {
                //       handleScan(result?.getText());
                //     }
                //   }}
                // />

                <Scanner
                  components={{ audio: false, finder: false }}
                  constraints={{ facingMode: "environment" }}
                  allowMultiple={false}
                  scanDelay={300}
                  paused={!scanCode}
                  onScan={(result) => {
                    //     console.log(result);
                    if (result && result.length > 0) {
                      handleScan(result[0].rawValue);
                    }
                  }}
                />
              )}
            </>
          )}
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};
