import React from "react";
import styled from "styled-components";
import { ToastType, getIcon } from "../../common/toastTypes";

export interface ToastProps {
  message: string;
  color?: string;
  toastType?: ToastType;
}

const ToastContainer = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  background-color: ${(props) => props.color};
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 14px;

  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
`;

const Icon = styled.div`
font-size: 20px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;


export const Toast: React.FC<ToastProps> = ({ message, color = "#333", toastType = "success" }) => {
  return (
    <ToastContainer color={color}>
      <Icon>{getIcon(toastType)}</Icon>
      <span>{message}</span>
    </ToastContainer>
  );
};