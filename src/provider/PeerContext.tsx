import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PeerContext = createContext({
  setDataRecieved: () => {},
  resetDataRecieved: () => {},
  isDataReceived: 0,
});

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }: any) => {
  const [isDataReceived, setIsDataReceived] = useState<number>(0);
  const setDataRecieved = () => {
    setIsDataReceived(1);
  };

  const resetDataRecieved = () => {
    setIsDataReceived(0);
  };

  return (
    <PeerContext.Provider
      value={{
        setDataRecieved,
        resetDataRecieved,
        isDataReceived,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
