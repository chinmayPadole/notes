// Dropdown.tsx
import React, { useState } from "react";
import styled from "styled-components";

const DropdownContainer = styled.div`
  position: relative;
  width: 150px;
  font-family: Arial, sans-serif;
`;

const DropdownButton = styled.button<{ $isopen: boolean }>`
  width: 100%;
  padding: 10px;
  background-color: #fff;
  border: 1.5px solid #e7e7e9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;

  &:focus {
    outline: none;
  }

  ${({ $isopen: isOpen }) =>
    isOpen &&
    `
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `}
`;

const DropdownList = styled.ul<{ $isopen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: calc(100% - 2.67px);
  opacity: ${({ $isopen: isOpen }) => (isOpen ? "1" : "0")};
  background-color: #fff;
  border: 1.5px solid #e7e7e9;
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  max-height: ${({ $isopen: isOpen }) => (isOpen ? "150px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
  z-index: 100;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding-left: 0;
`;

const DropdownListItem = styled.li<{ $isselected: boolean }>`
  padding: 7px;
  cursor: pointer;
  color: #333;
  background-color: "#fff";
  display: flex;
  justify-content: space-between;
  align-items: center;

  & p {
    display: flex;
    justify-content: space-between;
    width: 90%;
    padding: 8px;
    border-radius: 7px;
    background-color: ${({ $isselected: isSelected }) =>
      isSelected ? "#f3f3f4" : "#fff"};
  }

  & p:hover {
    background-color: #f1f1f1;
  }
`;

const ArrowIcon = styled.span<{ $isopen: boolean }>`
  display: inline-block;
  margin-left: 10px;
  transition: transform 0.3s ease;
  transform: ${({ $isopen: isOpen }) =>
    isOpen ? "rotate(180deg)" : "rotate(0deg)"};

  & svg {
    fill: currentColor;
    width: 12px;
    height: 12px;
  }
`;

const CheckIcon = styled.span`
  display: inline-block;
  margin-left: 10px;
  color: #333;
`;

type DropdownProps = {
  options: string[];
  selectedOption: string | null;
  setSelectedOption: React.Dispatch<React.SetStateAction<string | null>>;
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedOption,
  setSelectedOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <DropdownContainer>
      <DropdownButton $isopen={isOpen} onClick={handleToggle}>
        {selectedOption}
        <ArrowIcon $isopen={isOpen}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            role="img"
          >
            <path
              strokeWidth="0.9600000000000002"
              d="M21.5265 8.77171C22.1578 8.13764 22.1578 7.10962 21.5265 6.47555C20.8951 5.84148 19.8714 5.84148 19.24 6.47555L11.9999 13.7465L4.75996 6.47573C4.12858 5.84166 3.10492 5.84166 2.47354 6.47573C1.84215 7.10979 1.84215 8.13782 2.47354 8.77188L10.8332 17.1671C10.8408 17.1751 10.8486 17.183 10.8565 17.1909C11.0636 17.399 11.313 17.5388 11.577 17.6103C11.5834 17.6121 11.5899 17.6138 11.5964 17.6154C12.132 17.7536 12.7242 17.6122 13.1435 17.1911C13.1539 17.1807 13.1641 17.1702 13.1742 17.1596L21.5265 8.77171Z"
            ></path>
          </svg>
        </ArrowIcon>
      </DropdownButton>
      <DropdownList $isopen={isOpen}>
        {options.map((option, index) => (
          <DropdownListItem
            key={option}
            $isselected={option === selectedOption}
            onClick={() => handleOptionClick(option)}
            style={{
              paddingBottom: index === 0 ? 0 : 10,
              paddingTop: index === options.length - 1 || index === 0 ? 10 : 0,
            }}
          >
            <p>
              {option}
              {option === selectedOption && <CheckIcon>✔</CheckIcon>}
            </p>
          </DropdownListItem>
        ))}
      </DropdownList>
    </DropdownContainer>
  );
};
