import { title } from "process";
import React, { useState } from "react";
import styled from "styled-components";

const SectionWrapper = styled.div`
  margin: 10px 0;
  padding: 0 10px;
  width: 100%;
  z-index: 2;
`;

const SectionHeader = styled.div`
  color: #000;
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionContent = styled.div<{ $isopen: boolean }>`
  max-height: ${(props) => (props.$isopen ? "1000px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  border-radius: 10px;
`;

const ItemList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li`
  background: #444;
  color: #fff;
  padding: 10px;
  border-bottom: 1px solid #555;
`;

const Arrow = styled.span<{ $isopen: boolean }>`
  transform: ${(props) => (props.$isopen ? "rotate(0deg)" : "rotate(-90deg)")};
  transition: transform 0.3s;
`;

const QuickViewContainer = styled.div<{ $iscollapsed: boolean }>`
  display: flex;
  flex-flow: column;

  top: 145px;
  right: 0;
  z-index: 1;
  transition: position 0.3s ease-in-out;
  position: fixed;
  width: ${(props) => (props.$iscollapsed ? "0px" : "205px")};
  padding: 0 10px;
  transition: width 0.3s ease-in-out;
`;

const Divider = styled.div`
  content: "";
  display: block;
  width: 1px;
  background: rgb(230, 230, 230);
  height: 100%;
`;

const CollapsibleButton = styled.div<{ $iscollapsed: boolean }>`
  position: fixed;
  top: 115px;
  right: -15px;
  padding: 5px;
  width: 30px;
  height: 30px;
  transform: ${(props) =>
    props.$iscollapsed ? "rotate(-90deg)" : "rotate(90deg)"};
  border-radius: 10px;
  background: radial-gradient(circle, #0e0e0e 15%, #010101);
  cursor: pointer;

  & svg {
    transform: ${(props) =>
      props.$iscollapsed ? "translateY(-5px)" : "translateY(5px)"};
  }
`;

export const QuickView: React.FC<{
  isCollapsed: boolean;
  setIsCollapsed: (collapse: boolean) => void;
}> = ({ isCollapsed, setIsCollapsed }) => {
  const [OpenSections, setIsOpen] = useState<number[]>([]);

  const sections = [
    {
      title: "To Do",
      items: ["John", "Ashley", "Bobby", "Jimmy", "Freddie"],
    },
    {
      title: "Completed",
      items: ["John", "Ashley", "Bobby", "Jimmy", "Freddie"],
    },
  ];
  return (
    <>
      {!isCollapsed && <Divider />}
      <CollapsibleButton
        $iscollapsed={isCollapsed}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <path
              d="M18 18L12 12L6 18"
              stroke="red"
              strokeWidth="1.8"
            ></path>{" "}
            <path d="M18 12L12 6L6 12" stroke="red" strokeWidth="1.8"></path>{" "}
          </g>
        </svg>
      </CollapsibleButton>
      <QuickViewContainer $iscollapsed={isCollapsed}>
        {sections.map((section, index) => {
          return (
            <SectionWrapper key={index}>
              <SectionHeader
                onClick={() =>
                  setIsOpen((prev) =>
                    prev.includes(index)
                      ? prev.filter((x) => x !== index)
                      : [...prev, index]
                  )
                }
              >
                {section.title}
                <Arrow $isopen={OpenSections.includes(index)}>
                  <svg
                    data-icon-name="caret-down"
                    fill="#409cff"
                    fillRule="evenodd"
                    height="24px"
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    stroke="none"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                    width="24px"
                  >
                    <path
                      d="M15.767 12.051c0 .015-.003.028-.004.043a.79.79 0 0 1-.23.523l-.002.003-5.647 5.647a.802.802 0 0 1-1.135.003l-.282-.283a.802.802 0 0 1 .002-1.134l4.802-4.801-4.8-4.801a.802.802 0 0 1-.004-1.135l.283-.283a.802.802 0 0 1 1.134.004l5.367 5.366.283.283c.15.15.226.345.231.543l.002.022z"
                      transform="rotate(90 12 12.052)"
                    ></path>
                  </svg>
                </Arrow>
              </SectionHeader>
              <SectionContent $isopen={OpenSections.includes(index)}>
                <ItemList>
                  {section.items.map((item, index) => (
                    <Item key={index}>{item}</Item>
                  ))}
                </ItemList>
              </SectionContent>
            </SectionWrapper>
          );
        })}
      </QuickViewContainer>
    </>
  );
};
