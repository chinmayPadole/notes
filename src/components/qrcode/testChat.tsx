import React, { useEffect, useRef, useState } from "react";
import Peer, { DataConnection } from "peerjs";

export const Chat: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);

  useEffect(() => {
    const isPrimary = localStorage.getItem("is_primary");
    const peer =
      isPrimary === "true"
        ? new Peer("47a219fb-27da-4919-9449-664c4c64a132")
        : new Peer();
    peerRef.current = peer;

    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("connection", (conn) => {
      setConnection(conn);
      connRef.current = conn;
      console.log("CONNECTION ESTABLISHED");
      conn.on("data", (data) => {
        const newMessages = [...messages, data] as string[];
        setMessages(newMessages);
      });
    });

    return () => {
      peer.disconnect();
      peer.destroy();
    };
  }, []);

  const connectToPeer = (peerId: string) => {
    const conn = peerRef.current!.connect(peerId);
    setConnection(conn);
    console.log(conn);
    connRef.current = conn;

    conn.on("data", (data) => {
      const newMessages = [...messages, data] as string[];
      setMessages(newMessages);
    });
  };

  const sendMessage = () => {
    if (connection && message.trim()) {
      connection.send(message);
      setMessages((prevMessages) => [...prevMessages, `Me: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div>
      <h1>PeerJS Chat</h1>
      <div>
        <h2>Your ID: {peerId}</h2>
        <input
          type="text"
          placeholder="Enter peer ID to connect"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value) {
              connectToPeer(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
      <div>
        <h3>Messages</h3>
        <div>
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};
