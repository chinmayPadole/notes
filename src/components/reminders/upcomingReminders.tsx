import React, { useEffect } from "react";
import styled from "styled-components";
import { Dot } from "../note/note";
import { useTimerManager } from "../../service/useTimeManager";
import CalendarEvent from "./calendarEvent";

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

const EventsWrapper = styled.div`
  max-width: 400px;
  margin: 20px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

export const Reminders: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  // const { timers, addTimer, removeTimer, clearAllTimers } = useTimerManager();
  const { timers, addTimer } = useTimerManager();

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
          <EventsWrapper>
            {timers.map((event) => (
              <CalendarEvent
                key={event.id}
                title={"event.delay"}
                time={event.delay.toString()}
              />
            ))}
          </EventsWrapper>
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};
