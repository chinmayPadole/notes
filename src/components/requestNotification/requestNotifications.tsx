// src/FloatingSquare.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Square = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 250px;
  height: 200px;
  background: radial-gradient(circle, #0e0e0e 15%, #010101);
  border-radius: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  z-index: 3;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 30px;
  color: #fff;
  cursor: pointer;
`;

const Content = styled.div`
  color: #fff;
  font-weight: 600;
  padding: 20px;
  text-align: left;
  font-size: larger;
`;

const Actions = styled.div`
  display: flex;
  gap: 2em;
  & button {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    color: #fff;
    font-weight: 600;
    background: none;
    cursor: pointer;
  }
`;
export const RequestNotificationPermission: React.FC = () => {
  const [content, setContent] = useState<string>(
    Notification.permission !== "granted"
      ? " Do not miss any task with reminders. Allow notifications to stay up to date."
      : ""
  );

  useEffect(() => {
    if (Notification.permission === "denied") {
      setContent("Please reset browser permissions to allow notifications.");
    }
  }, []);

  const [isVisible, setIsVisible] = useState(true);

  const requestNotification = () => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
          } else {
            console.log("Notification permission denied.");
          }
        })
        .finally(handleClose);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Square>
      <CloseButton onClick={handleClose}>&times;</CloseButton>
      <Content>{content}</Content>
      {Notification.permission !== "denied" && (
        <Actions>
          <button style={{ background: "red" }} onClick={requestNotification}>
            Allow
          </button>
          <button style={{ border: "2px solid red" }} onClick={handleClose}>
            Deny
          </button>
        </Actions>
      )}
    </Square>
  );
};
