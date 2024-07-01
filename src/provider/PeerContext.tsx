import Peer, { DataConnection } from "peerjs";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { manageNotesSync } from "../common/notesDataManagement";
import { useToast } from "./toastProvider";

const PeerContext = createContext({
  connectToPeer: () => {},
  syncNotes: () => {},
  isConnectionEstablished: false,
  isDataReceived: 0,
  initialPeerId: "",
});

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }: any) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [initialPeerId, setInitialPeerId] = useState<string>("");
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [isConnectionEstablished, setConnectionEstablished] =
    useState<boolean>(false);
  const [isDataReceived, incrementDataReceived] = useState<number>(0);
  const [retryCounter, setRetryCount] = useState<number>(0);

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (peerId && peerRef && peerRef.current) {
      const id = localStorage.getItem("peer_id");
      const app_id = localStorage.getItem("app_id");
      const isPrimary = app_id === id;
      if (id !== null && (isPrimary === false || isPrimary === null)) {
        connectToPeer();
      }
    }
  }, [peerRef, peerId]);

  // useEffect(() => {
  //   if (peerId && !isConnectionEstablished) {
  //     console.log("overriding peerId");
  //     localStorage.setItem("peer_id", peerId);
  //   }
  // }, [isConnectionEstablished]);

  useEffect(() => {
    const app_id = localStorage.getItem("app_id");

    if (app_id !== null) {
      const peer = new Peer(app_id);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setPeerId(id);
        setInitialPeerId(id);
      });

      peer.on("connection", (conn) => {
        setConnection(conn);
        connRef.current = conn;
        setRetryCount(0);
        setConnectionEstablished(true);
        console.log("CONNECTION ESTABLISHED");
        showToast("device linked", "#333", 2000, "success");
        conn.on("data", (data) => {
          const receivedData = data as {
            type: string;
            content: string;
          };
          if (receivedData.type === "content") {
            incrementDataReceived((currentCount) => currentCount + 1);
            manageNotesSync(receivedData.content);
          }
        });
      });

      peer.on("close", () => {
        resetStore();
      });

      peer.on("error", (error) => {
        console.error(error);
        resetStore();
        if (retryCounter > 0) {
          setRetryCount(10);
        }
      });

      return () => {
        peer.disconnect();
        peer.destroy();
      };
    }
  }, []);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (retryCounter > 0) {
      timerId = setTimeout(() => {
        setRetryCount((count) => count - 1);
        connectToPeer();
        // console.log("RETRY ATTEMPT");
      }, 2000);
    }

    return () => clearTimeout(timerId);
  }, [retryCounter]);

  const connectToPeer = () => {
    const peer_id = localStorage.getItem("peer_id");
    if (peer_id) {
      const conn = peerRef.current!.connect(peer_id);
      setConnection(conn);

      connRef.current = conn;

      conn.on("data", (data) => {
        const receivedData = data as {
          type: string;
          content: string;
        };
        if (receivedData.type === "content") {
          incrementDataReceived((currentCount) => currentCount + 1);
          manageNotesSync(receivedData.content);
        }
      });

      conn.on("open", () => {
        setConnectionEstablished(true);
        showToast("device linked", "#333", 2000, "success");
        setRetryCount(0);
      });

      conn.on("close", () => {
        resetStore();
      });

      conn.on("error", (error) => {
        console.log(error);
        resetStore();
        if (retryCounter > 0) {
          setRetryCount(10);
        }
      });
    }
  };

  const resetStore = () => {
    //localStorage.removeItem("peer_id");
    setConnectionEstablished(false);
    setConnection(null);
  };

  const syncNotes = () => {
    const notes = localStorage.getItem("notes");
    if (connection && notes) {
      const data = { type: "content", content: notes };
      connection.send(data);
    }
  };

  return (
    <PeerContext.Provider
      value={{
        syncNotes,
        connectToPeer,
        isConnectionEstablished,
        isDataReceived,
        initialPeerId,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
