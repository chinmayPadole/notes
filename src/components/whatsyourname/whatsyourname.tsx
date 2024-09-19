import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { Header } from "../logo/logo";
import { addData, getData, initDB, Stores } from "../../db/IndexedDBManager";

// Keyframe for the shake animation
const shakeAnimation = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-10px);
  }
  40%, 80% {
    transform: translateX(10px);
  }
`;

// Styled component for the modal background
const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
`;

// Styled component for the modal container
const ModalContainer = styled.div<{ shake: boolean }>`
  padding: 2rem;
  border-radius: 5px;
  width: 400px;
  background: #000;
  color: #fff;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: ${({ shake }) =>
    shake
      ? css`
          ${shakeAnimation} 0.5s ease
        `
      : "none"};
`;

// Styled component for the close button
const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #fff;
  &:hover {
    color: red;
  }
`;

// Styled component for the input field
const InputField = styled.input`
  width: 95%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  outline-color: red;
`;

// Styled component for the submit button
const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  &:hover {
    background-color: #0056b3;
  }
`;

// Modal Component
export const WhatsYourName: React.FC<{
  setMainVisible: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setMainVisible }) => {
  const [name, setName] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);
  const [isVisible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    handleLaunch();
  }, []);

  const handleLaunch = async () => {
    initDB().then(async (result) => {
      //console.log(result);
      if (result) {
        const userNameData = (await getData(Stores.Username)) as any;
        //console.log(userNameData);
        if (
          userNameData.length === 0 ||
          userNameData[0].value === undefined ||
          userNameData[0].value.username.trim() === ""
        ) {
          setVisible(true);
        } else {
          setName(userNameData[0].value.username);
          setMainVisible(true);
        }
      }
    });
  };

  // Handle the close button click event
  const handleClose = async () => {
    if (name.trim() === "") {
      setShake(true); // Trigger the shake animation
      setTimeout(() => setShake(false), 500); // Reset shake after animation
    } else {
      await addData(Stores.Username, { username: name });
      setVisible(false);
      setMainVisible(true);
    }
  };

  return (
    <>
      {isVisible && (
        <ModalBackground>
          <ModalContainer shake={shake}>
            <CloseButton onClick={handleClose}>&times;</CloseButton>
            <div
              style={{
                width: "120px",
                height: "120px",
                position: "relative",
                marginLeft: "calc(45%)",
              }}
            >
              {Header}
            </div>
            <h2>Hey! what should I call you ?</h2>
            <br />
            <br />
            <InputField
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={10}
            />
            <SubmitButton onClick={handleClose}>Submit</SubmitButton>
          </ModalContainer>
        </ModalBackground>
      )}
    </>
  );
};
