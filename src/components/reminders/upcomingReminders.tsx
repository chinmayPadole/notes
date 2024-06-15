import React, { useEffect } from "react";
import styled from "styled-components";
import { getReminders, useTimerManager } from "../../service/useTimeManager";
import { formatDateTime } from "../../common/utils";
import "./reminders.css";

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
`;

export const Reminders: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  // const { timers, addTimer, removeTimer, clearAllTimers } = useTimerManager();

  const reminders = getReminders();

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
        <ModalHeader>Upcoming Reminders</ModalHeader>
        <ModalContent>
          {reminders
            .sort(
              (a, b) =>
                new Date(b.reminderDate).getTime() -
                new Date(a.reminderDate).getTime()
            )
            .map((event, index) => {
              return (
                <div className="reminder-container">
                  <div className="reminder-header">
                    <div className="reminder-circle"></div>
                    {formatDateTime(event.reminderDate)}
                  </div>

                  <div className="reminder-content">{event.reminderText}</div>
                </div>
              );
            })}
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};
