import React, { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext({
  setupSocket: async (sessionId: string) => {},
  syncNotes: (data: any) => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: any) => {
  const [ws, setWs] = useState<WebSocket | null>();
  let isSetupStarted: boolean = false;

  const setupSocketInternal = async (sessionId: string) => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      setWs(socket);
      console.log("open");
      socket.send(JSON.stringify({ type: "init", sessionId }));
    };

    socket.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(event.data);
      if (data.type === "data") {
        console.log("Received data:", data.payload);
      }
    };
  };

  const syncNotes = (data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("INSIDE SYNC NOTES");
      const id = localStorage.getItem("ws_server_id");
      ws.send(JSON.stringify({ type: "data", sessionId: id, payload: data }));
    } else {
      console.error("WebSocket is not open");
    }
  };

  const setupSocket = async (id: string) => {
    if (ws === null || ws === undefined) {
      setupSocketInternal(id);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("ws_server_id");
    if (id !== null && (ws === null || ws === undefined) && !isSetupStarted) {
      console.log("open : SOURCE", id, ws);
      setupSocketInternal(id);
      isSetupStarted = true;
    }
  }, []);

  return (
    <SocketContext.Provider value={{ syncNotes, setupSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
