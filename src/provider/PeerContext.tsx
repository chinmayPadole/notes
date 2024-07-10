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
  tryRetry: () => {},
});

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }: any) => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [initialPeerId, setInitialPeerId] = useState<string>("");
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [isConnectionEstablished, setConnectionEstablished] =
    useState<boolean>(false);
  const [isDataReceived, incrementDataReceived] = useState<number>(0);
  const [retryCounter, setRetryCount] = useState<number | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  const [isDataAck, setAck] = useState<boolean | null>(null);
  const [checkAck, setCheckAck] = useState<boolean>(false);

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

  useEffect(() => {
    const app_id = localStorage.getItem("app_id");

    if (app_id !== null && isConnectionEstablished === false) {
      if (peerRef.current !== null) {
        peerRef.current.disconnect();
        peerRef.current.destroy();
      }
      const peer = new Peer(app_id);
      peerRef.current = peer;

      peer.on("open", (id) => {
        setPeerId(id);
        setInitialPeerId(id);
      });

      peer.on("connection", (conn) => {
        setConnection(conn);
        connRef.current = conn;
        setConnectionEstablished(true);
        console.log("CONNECTION ESTABLISHED");
        localStorage.setItem("peerStatus", "peer_added");
        showToast("device linked", "#333", 2000, "success");
        conn.on("data", (data) => {
          const receivedData = data as {
            type: string;
            content: string;
          };
          if (receivedData.type === "content") {
            incrementDataReceived((currentCount) => currentCount + 1);
            manageNotesSync(receivedData.content);
            conn.send({ type: "ack", content: "" });
          } else if (receivedData.type === "ack") {
            setAck(true);
            showToast("synced", "#30DB5B", 3000, "info");
          }
        });
      });

      peer.on("close", () => {
        resetStore();
      });

      peer.on("error", (error) => {
        console.error(error);
        if (error.message.includes("Could not connect to peer")) {
          // either retry counter is null
          // which means retry was never started and first time error occured
          // so set the retry to 5
          // else retry was a number so decrement the retry
          setRetryCount((counter) => (counter !== null ? counter - 1 : 5));
        }
        resetStore();
      });

      return () => {
        peer.disconnect();
        peer.destroy();
      };
    }
  }, []);

  useEffect(() => {
    if (retryCounter !== null && !isConnectionEstablished) {
      if (isConnectionEstablished && intervalId !== null) {
        clearInterval(intervalId);
        return;
      }

      if (retryCounter <= 0 && intervalId !== null) {
        // Limit the number of retries
        console.error("Failed to establish connection after 5 retries");
        clearInterval(intervalId);
        return;
      }

      const interval = setInterval(() => {
        connectToPeer();
      }, 2000);

      setIntervalId(interval);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isConnectionEstablished, retryCounter]);

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
          conn.send({ type: "ack", content: "" });
        } else if (receivedData.type === "ack") {
          setAck(true);
        }
      });

      conn.on("open", () => {
        setConnectionEstablished(true);
        showToast("device linked", "#333", 2000, "success");
        setRetryCount(0);
      });

      conn.on("close", () => {
        console.log("CLOSING");
        resetStore();
      });

      conn.on("error", (error) => {
        console.log("ERROR", error);
        resetStore();
      });
    }
  };

  const resetStore = () => {
    //localStorage.removeItem("peer_id");
    setConnectionEstablished(false);
    setConnection(null);
  };

  useEffect(() => {
    if (checkAck) {
      const timeout = setTimeout(() => {
        if (isDataAck === false || isDataAck === null) {
          setConnectionEstablished(false);
          setConnection(null);
          showToast("device unreachable", "#333", 2000, "error");
        }
      }, 2000);

      return () => {
        setCheckAck(false);
        setAck(null);
        clearTimeout(timeout);
      };
    }
  }, [checkAck, isDataAck]);

  const syncNotes = () => {
    setCheckAck(false);
    const notes = localStorage.getItem("notes");
    if (connection && notes) {
      const data = { type: "content", content: notes };
      connection.send(data);
      setCheckAck(true);
    }
  };

  const tryRetry = () => {
    if (!isConnectionEstablished && peerRef && peerRef.current) {
      setRetryCount(5);
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
        tryRetry,
      }}
    >
      {children}
    </PeerContext.Provider>
  );
};
