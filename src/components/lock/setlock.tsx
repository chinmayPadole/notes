import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import "./style.css";
import { useToast } from "../../provider/toastProvider";
import { useSecurity } from "../../provider/securityProvider";

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

  background: radial-gradient(circle, #0e0e0e 15%, #010101);
  color: #fff;
`;

const ModalHeader = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  color: red;
  font-weight: 600;
`;

const ModalContent = styled.div`
  font-size: 18px;
  margin-bottom: 20px;

  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;

  width: 412px;
  height: 160px;

  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 2em;
  align-items: center;
`;

const SaveButton = styled.button`
  color: white;
  background-color: var(--inputBG);
  width: max-content;
  padding: 10px;
  border-radius: 10px;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

export const SetLockPin: React.FC<{
  show: boolean;
  onClose: () => void;
  preventNewNoteDetection: React.Dispatch<React.SetStateAction<boolean>>;
  toggleLock: (lock: boolean) => void;
}> = ({ show, onClose, preventNewNoteDetection, toggleLock }) => {
  const [lockPin, setLockPin] = useState<string | null>(null);
  const [mode, SetMode] = useState<string>("setLock");

  const { toggleSessionUnlock, toggleLockPinModal } = useSecurity();

  const { showToast } = useToast();

  useEffect(() => {
    const pin = localStorage.getItem("pin");
    preventNewNoteDetection(true);
    if (pin && pin.trim().length === 6) {
      toggleLock(true);
      SetMode("removeLock");
    } else {
      setLockPin("");
      SetMode("setLock");
    }

    return () => {
      preventNewNoteDetection(false);
      //toggleLockPinModal(false);
    };
  }, []);

  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  const inputRef4 = useRef<HTMLInputElement>(null);
  const inputRef5 = useRef<HTMLInputElement>(null);
  const inputRef6 = useRef<HTMLInputElement>(null);

  const getEnteredPin = () => {
    if (
      inputRef1.current &&
      inputRef2.current &&
      inputRef3.current &&
      inputRef4.current &&
      inputRef5.current &&
      inputRef6.current
    ) {
      const pin =
        inputRef1.current.value +
        inputRef2.current.value +
        inputRef3.current.value +
        inputRef4.current.value +
        inputRef5.current.value +
        inputRef6.current.value;

      return pin;
    }

    return null;
  };

  const onSaveClick = () => {
    const pin = getEnteredPin();

    if (pin && pin.length === 6) {
      localStorage.setItem("pin", pin);
      setLockPin(pin);
      preventNewNoteDetection(false);
      showToast("pin set", "#333", 3000);

      toggleLock(true);
      onClose();
      toggleLockPinModal(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        preventNewNoteDetection(false);
        onClose();
        toggleLockPinModal(false);
      }
    };

    if (show) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);

  // if (!show) {
  //   return null;
  // }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: string
  ) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      inputRef1.current &&
      inputRef2.current &&
      inputRef3.current &&
      inputRef4.current &&
      inputRef5.current &&
      inputRef6.current
    ) {
      // Let the delete/backspace happen first before checking the value
      setTimeout(() => {
        switch (input) {
          case "2":
            if (inputRef2.current && !inputRef2.current.value) {
              inputRef1.current?.focus();
            }
            break;
          case "3":
            if (inputRef3.current && !inputRef3.current.value) {
              inputRef2.current?.focus();
            }
            break;
          case "4":
            if (inputRef4.current && !inputRef4.current.value) {
              inputRef3.current?.focus();
            }
            break;
          case "5":
            if (inputRef5.current && !inputRef5.current.value) {
              inputRef4.current?.focus();
            }
            break;
          case "6":
            if (inputRef6.current && !inputRef6.current.value) {
              inputRef5.current?.focus();
            }
            break;
          default:
            break;
        }
      }, 0);
    }
  };

  const onInput = (input: string) => {
    switch (input) {
      case "1":
        inputRef2.current?.focus();
        break;
      case "2":
        inputRef3.current?.focus();
        break;
      case "3":
        inputRef4.current?.focus();
        break;
      case "4":
        inputRef5.current?.focus();
        break;
      case "5":
        inputRef6.current?.focus();
        break;
      default:
        // code block
        break;
    }
  };

  const onUnlockClick = () => {
    const storedPin = localStorage.getItem("pin");
    const pin = getEnteredPin();
    if (pin && storedPin && pin === storedPin) {
      showToast("removed", "#333", 3000);
      toggleSessionUnlock(true);
      preventNewNoteDetection(false);
      onClose();
      toggleLockPinModal(false);
    }
  };

  const onRemoveLockClick = () => {
    const storedPin = localStorage.getItem("pin");

    const pin = getEnteredPin();
    if (pin && storedPin && pin === storedPin) {
      showToast("unlocked", "#333", 3000);
      localStorage.removeItem("pin");
      localStorage.removeItem("isLocked");
      sessionStorage.removeItem("isSessionUnlocked");
      preventNewNoteDetection(false);
      onClose();
      toggleLockPinModal(false);
    }
  };

  return (
    <>
      <Overlay onClick={onClose}>
        <ModalWrapper onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            {mode == "setLock" ? "Set lock pin" : "Unlock"}
          </ModalHeader>
          <ModalContent>
            <div className="pinSet">
              <input
                type="text"
                data-index="0"
                maxLength={1}
                autoFocus={true}
                ref={inputRef1}
                onInput={() => onInput("1")}
                //onKeyDown={(e) => handleKeyDown(e, "1")}
              />
              <input
                type="text"
                data-index="1"
                maxLength={1}
                ref={inputRef2}
                onInput={() => onInput("2")}
                onKeyDown={(e) => handleKeyDown(e, "2")}
              />
              <input
                type="text"
                data-index="2"
                maxLength={1}
                ref={inputRef3}
                onInput={() => onInput("3")}
                onKeyDown={(e) => handleKeyDown(e, "3")}
              />
              <input
                type="text"
                data-index="3"
                maxLength={1}
                ref={inputRef4}
                onInput={() => onInput("4")}
                onKeyDown={(e) => handleKeyDown(e, "4")}
              />
              <input
                type="text"
                data-index="4"
                maxLength={1}
                ref={inputRef5}
                onInput={() => onInput("5")}
                onKeyDown={(e) => handleKeyDown(e, "5")}
              />
              <input
                type="text"
                data-index="5"
                maxLength={1}
                ref={inputRef6}
                onInput={() => onInput("6")}
                onKeyDown={(e) => handleKeyDown(e, "6")}
              />
            </div>
            {mode === "setLock" && (
              <SaveButton onClick={onSaveClick}>Save</SaveButton>
            )}
            {mode === "removeLock" && (
              <ButtonWrapper>
                <SaveButton onClick={onRemoveLockClick}>Remove Lock</SaveButton>
                <SaveButton onClick={onUnlockClick}>Unlock</SaveButton>
              </ButtonWrapper>
            )}
          </ModalContent>
        </ModalWrapper>
      </Overlay>
    </>
  );
};
