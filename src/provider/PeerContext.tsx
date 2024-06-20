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

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (peerId && peerRef && peerRef.current) {
      const id = localStorage.getItem("peer_id");
      const isPrimary = localStorage.getItem("is_primary");

      if (id !== null && (isPrimary === "false" || isPrimary === null)) {
        connectToPeer();
      }
    }
  }, [peerRef, peerId]);

  useEffect(() => {
    if (peerId && !isConnectionEstablished) {
      console.log("overriding peerId");
      localStorage.setItem("peer_id", peerId);
    }
  }, [isConnectionEstablished]);

  useEffect(() => {
    const peer_id = localStorage.getItem("peer_id");
    const isPrimary = localStorage.getItem("is_primary");

    const peer =
      peer_id !== null && isPrimary === "true" ? new Peer(peer_id) : new Peer();
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
      showToast("device linked", "#30DB5B", 2000, "success");
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

    peer.on("error", (error) => {
      console.error(error);
      resetStore();
    });

    return () => {
      peer.disconnect();
      peer.destroy();
    };
  }, []);

  const connectToPeer = () => {
    const peer_id = localStorage.getItem("peer_id");
    if (peer_id) {
      const conn = peerRef.current!.connect(peer_id);
      setConnection(conn);

      connRef.current = conn;
      setConnectionEstablished(true);
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

      conn.on("error", (error) => {
        console.log(error);
        resetStore();
      });
    }
  };

  const resetStore = () => {
    localStorage.removeItem("peer_id");
    localStorage.removeItem("is_primary");
    setConnectionEstablished(false);
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
