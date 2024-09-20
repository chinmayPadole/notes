import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PeerContext = createContext({
  setDataRecieved: (isReceived: boolean) => {},
  isDataReceived: 0,
});

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }: any) => {
  const [isDataReceived, setIsDataReceived] = useState<number>(0);
  const setDataRecieved = (isReceived: boolean) => {
    setIsDataReceived(isReceived === true ? 1 : 0);
  };

  return (
    <PeerContext.Provider
      value={{
        isDataReceived,
        setDataRecieved,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
