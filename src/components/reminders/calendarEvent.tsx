import React from 'react';
import styled from 'styled-components';

interface EventProps {
  title: string;
  time: string;
}

const EventWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin: 5px 0;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EventTitle = styled.span`
  font-weight: bold;
  color: #333;
`;

const EventTime = styled.span`
  color: #666;
`;

const CalendarEvent: React.FC<EventProps> = ({ title, time }) => {
  return (
    <EventWrapper>
      <EventTitle>{title}</EventTitle>
      <EventTime>{time}</EventTime>
    </EventWrapper>
  );
};

export default CalendarEvent;