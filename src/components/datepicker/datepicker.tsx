import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useToast } from "../../provider/toastProvider";
import { getNextMonday } from "../../common/utils";

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
  height: max-content;
  text-align: center;
  position: relative;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #fff;
  font-size: 25px;
`;

const DateTimeInput = styled.input`
  color: #fff;
  outline: none;
  font-size: 16px;

  padding: 0;
  border: 0;
  background: no-repeat;
  &:focus {
    border-color: #ff7e5f;
  }
  &::selection {
    background-color: transparent;
  }
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  background: red;
  color: white;
  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const Presets = styled.div`
  & ul {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 10px;
    font-size: 16px;

    & li {
      padding: 10px;
      border: 1px solid #5b5b5b;
      cursor: pointer;
      color: #fff;
      background: #7d7c7a;

      /*Prevent text selection*/
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Old versions of Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
    }

    & > li:nth-child(1) {
      border-top-left-radius: 10px;
    }
    & > li:nth-child(4) {
      border-bottom-left-radius: 10px;
    }
    & > li:nth-child(3) {
      border-top-right-radius: 10px;
    }
    & > li:nth-child(6) {
      border-bottom-right-radius: 10px;
    }

    @media (max-width: 500px) {
      grid-template-columns: 1fr;

      & > li:nth-child(1) {
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
      }
      & > li:nth-child(6) {
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
      }
      & > li:nth-child(4) {
        border-bottom-left-radius: 0;
      }
      & > li:nth-child(3) {
        border-top-right-radius: 0;
      }
    }
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
  const [selectedOption, setReminderOption] = useState<string | null>(null);
  const { showToast } = useToast();

  const [date, setDate] = useState(toLocalISOString(new Date()));

  const closeModal = (setDate: boolean = false) => {
    if (setDate && selectedOption !== null) {
      setIsOpen(false);
      setSelectedDate(date);

      const word = selectedOption === "Next week" ? "" : "in";
      const toastMessage =
        selectedOption === "custom"
          ? "Reminder set for the date"
          : `Will remind ${word} ${selectedOption}`;

      showToast(toastMessage, "#333", 2000, "success");
    } else if (selectedOption === null) {
      showToast("Please select an option", "#333", 2000, "info");
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
    setReminderOption("custom");
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
            <Title>Pick reminder time</Title>
            <Presets>
              <ul>
                <li
                  style={{
                    background:
                      selectedOption === "20 minutes" ? "#bed4ff" : "#7d7c7a",
                    color: selectedOption === "20 minutes" ? "#000" : "#fff",
                  }}
                  onClick={() => {
                    setDate(
                      toLocalISOString(
                        new Date(new Date().getTime() + 20 * 60 * 1000)
                      )
                    );
                    setReminderOption("20 minutes");
                  }}
                >
                  In 20 minutes
                </li>
                <li
                  style={{
                    background:
                      selectedOption === "1 hour" ? "#bed4ff" : "#7d7c7a",
                    color: selectedOption === "1 hour" ? "#000" : "#fff",
                  }}
                  onClick={() => {
                    setDate(
                      toLocalISOString(
                        new Date(new Date().getTime() + 60 * 60 * 1000)
                      )
                    );
                    setReminderOption("1 hour");
                  }}
                >
                  In 1 hour
                </li>
                <li
                  style={{
                    background:
                      selectedOption === "3 hours" ? "#bed4ff" : "#7d7c7a",
                    color: selectedOption === "3 hours" ? "#000" : "#fff",
                  }}
                  onClick={() => {
                    setDate(
                      toLocalISOString(
                        new Date(new Date().getTime() + 3 * 60 * 60 * 1000)
                      )
                    );
                    setReminderOption("3 hours");
                  }}
                >
                  In 3 hours
                </li>
                <li
                  style={{
                    background:
                      selectedOption === "Tomorrow" ? "#bed4ff" : "#7d7c7a",
                    color: selectedOption === "Tomorrow" ? "#000" : "#fff",
                  }}
                  onClick={() => {
                    setDate(
                      toLocalISOString(
                        new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                      )
                    );
                    setReminderOption("Tomorrow");
                  }}
                >
                  Tomorrow
                </li>
                <li
                  style={{
                    background:
                      selectedOption === "Next week" ? "#bed4ff" : "#7d7c7a",
                    color: selectedOption === "Next week" ? "#000" : "#fff",
                  }}
                  onClick={() => {
                    setDate(toLocalISOString(getNextMonday()));
                    setReminderOption("Next week");
                  }}
                >
                  Next week
                </li>
                <li
                  onClick={() => setReminderOption("custom")}
                  style={{
                    background:
                      selectedOption === "custom" ? "#bed4ff" : "#7d7c7a",
                  }}
                >
                  <DateTimeInput
                    style={{
                      background:
                        selectedOption === "custom" ? "#bed4ff" : "#7d7c7a",
                      color: selectedOption === "custom" ? "#000" : "#fff",
                    }}
                    type="datetime-local"
                    value={date}
                    onChange={handleDateChange}
                  />
                </li>
              </ul>
            </Presets>
            <Button onClick={() => closeModal(true)}>Confirm</Button>
            <Button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: " 2px solid red" }}
            >
              Cancel
            </Button>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
};

export default DateTimePickerModal;
