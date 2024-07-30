import React, { useState } from "react";
import styled from "styled-components";

const QuickViewContainer = styled.div<{
  $isexpanded: string;
}>`
  width: 100%;
  height: ;
  background: #303030;
  position: fixed;
  bottom: 0;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  display: flex;
  justify-content: center;

  height: ${({ $isexpanded }) =>
    $isexpanded === "true" ? "30vh" : "calc(25vh - 170px)"};
  transition: height 0.3s ease-in-out;

  border-top: 2px solid #646464;
`;

const DragBar = styled.div`
  position: fixed;
  background: #d1d1d1;
  width: 200px;
  height: 10px;
  border-radius: 20px;
  cursor: pointer;
`;

const PlaceholderText = styled.div<{
  $isexpanded: string;
}>`
  margin-bottom: ${({ $isexpanded }) => ($isexpanded === "true" ? "16%" : "0")};
  transition: margin-bottom 0.3s ease-in-out;
  position: fixed;
  width: 100%;
  bottom: 0;
  height: 40px;
  color: #525353;
  font-size: 1.9rem;
  font-weight: bold;
  letter-spacing: -0.03em;
  text-align: center;
`;

const QuickContent = styled.div`
  width: 100%;
  padding-top: 20px;
  padding-left: 15px;
  padding-right: 15px;
  padding-bottom: 5px;
`;
export const QuickView: React.FC = () => {
  const [isExpanded, setExpanded] = useState<boolean>(false);

  return (
    <QuickViewContainer $isexpanded={isExpanded ? "true" : "false"}>
      <DragBar onClick={() => setExpanded((prev) => !prev)} />
      <PlaceholderText
        $isexpanded={isExpanded ? "true" : "false"}
        className="selection-prevention"
      >
        Double tap to note!
      </PlaceholderText>
      <QuickContent>Hello world</QuickContent>
    </QuickViewContainer>
  );
};
