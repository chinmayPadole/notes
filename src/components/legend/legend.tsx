import React, { useEffect } from "react";
import styled from "styled-components";
import { Dot } from "../note/note";

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

const LegendItem = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
  display: flex;
  gap: 1em;
  align-items: center;
`;

const dotItems = [
  { icon: <Dot color="#ff5f56" />, text: "delete note" },
  { icon: <Dot color="#27c93f" />, text: "copy content" },
  { icon: <Dot color="#0A20FF" />, text: "lock / unlock" },
  { icon: <Dot color="#FF9500" />, text: "note options" },
];

export const Legend: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
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
        <ModalHeader>Legend</ModalHeader>
        <ModalContent>
          {dotItems.map((item) => {
            return (
              <LegendItem>
                {item.icon}
                <span>{item.text}</span>
              </LegendItem>
            );
          })}
        </ModalContent>
      </ModalWrapper>
    </Overlay>
  );
};
