import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useToast } from "../../provider/toastProvider";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

const Modal = styled.div`
  background: radial-gradient(circle, #0e0e0e 15%, #010101);
  padding: 20px;
  border-radius: 20px;
  box-shadow: 2px 4px 16px #333;
  width: 70%;
  height: 30%;
  text-align: center;
  position: relative;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #fff;
  font-size: 25px;
`;

const DateTimeInput = styled.input`
  margin-top: 60px;
  padding: 10px;
  transform: translateX(-10px);
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  background: #333;
  color: #ced4da;
  outline: none;
  &:focus {
    border-color: #ff7e5f;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  background: red;
  color: white;
  margin: 0 5px;
  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const toLocalISOString = (date: Date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); //offset in milliseconds. Credit https://stackoverflow.com/questions/10830357/javascript-toisostring-ignores-timezone-offset

  // Optionally remove second/millisecond if needed
  return localDate.toISOString().slice(0, -8);
};

export const DateTimePickerModal: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}> = ({ isOpen, setIsOpen, selectedDate, setSelectedDate }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const [date, setDate] = useState(toLocalISOString(new Date()));
  const closeModal = (setDate: boolean = false) => {
    setIsOpen(false);
    if (setDate) {
      setSelectedDate(date);
      showToast("Reminder set!", "#333", 2000, "success");
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);

      setSelectedDate(null);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <ModalOverlay>
          <Modal ref={modalRef}>
            <Title>set reminder time</Title>
            <DateTimeInput
              type="datetime-local"
              value={date}
              onChange={handleDateChange}
            />
            <Button onClick={() => closeModal(true)}>Confirm</Button>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
};

export default DateTimePickerModal;
