import React, { useState, useEffect, useRef } from "react";
import { RandomAvatar } from "../randomAvatar/randomAvatar";
import "./sharenotes.css";
import { manageNotesSync } from "../../common/notesDataManagement";
import { useToast } from "../../provider/toastProvider";
import { getData, Stores } from "../../db/IndexedDBManager";
import { usePeer } from "../../provider/PeerContext";
const Peer = (window as any).SimplePeer;

interface PeerInfo {
  id: string;
}

export const ShareNotes: React.FC<{
  show: boolean;
  onClose: () => void;
}> = ({ onClose }) => {
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  // const [myId, setMyId] = useState<string | null>(null);
  const myId = useRef<string | null>(null); // Use ref to store myId
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]); // Track connected peers
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<{ [key: string]: any }>({}); // Store peer objects for each connection

  const { showToast } = useToast();
  const { setDataRecieved } = usePeer();
  // WebSocket connection and signaling setup
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // Initial delay in ms (2 seconds)

    const connectWebSocket = () => {
      const ws = new WebSocket("wss://super-notes-signalling-server.glitch.me");
      wsRef.current = ws;

      // const userNameData = (await getData(Stores.Username)) as any;
      // const userName = userNameData[0].value.username;
      ws.onopen = () => {
        // console.log(`Connected to WebSocket server with ID: ${myId.current}`);
        ws.send(
          JSON.stringify({ type: "join", id: myId.current, name: "test" })
        );
      };

      ws.onerror = (error) => {
        //console.log("Retrying");
        retryConnection();
      };

      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        //console.log(data);
        switch (data.type) {
          case "peer-list":
            setPeers(
              data.peers
                .filter((peerId: string) => peerId !== myId.current)
                .map((peerId: string) => ({ id: peerId }))
            );
            //setMyId(data.selfId);
            myId.current = data.selfId;
            break;
          case "new-peer":
            if (myId.current !== null) {
              setPeers((prev) => [...prev, { id: data.id }]);
            }
            break;
          case "signal":
            handleSignal(data.id, data.signal);
            break;
          case "peer-disconnected":
            setPeers((prev) => prev.filter((peer) => peer.id !== data.id));
            delete peersRef.current[data.id];
            setConnectedPeers((prev) => prev.filter((id) => id !== data.id));
            break;
          case "sync-complete":
            showToast("synced", "#333", 3000);
            if (peersRef.current) {
              peersRef.current[data.fromPeer].destroy();
            }
            handleClose();
        }
      };

      return () => {
        ws.close();
      };
    };

    const retryConnection = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        const delay = retryDelay * retryCount;
        // console.log(
        //   `Attempting to reconnect... Retry #${retryCount} in ${
        //     delay / 1000
        //   } seconds.`
        // );

        setTimeout(() => {
          connectWebSocket();
        }, delay);
      } else {
        // console.error("Max retries reached. Could not reconnect to WebSocket.");
      }
    };

    // Initial connection
    if (wsRef.current === null) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleClose = () => {
    if (wsRef.current && myId.current) {
      wsRef.current.send(JSON.stringify({ type: "delete", id: myId.current }));
      onClose();
    }
  };

  // Connect to a peer as an initiator
  const connectToPeer = (peerId: string) => {
    if (peersRef.current[peerId]) {
      //  console.log("Already connected to this peer.");
      return;
    }

    const peer = new Peer({ initiator: true, trickle: false });

    peer.on("signal", (signal: any) => {
      // console.log("Connect to peer, SENDING SIGNAL", signal);
      wsRef.current?.send(
        JSON.stringify({
          type: "signal",
          signal,
          id: myId.current,
          target: peerId,
        })
      );
    });

    peer.on("connect", () => {
      // console.log("Connected to peer:", peerId);
      setConnectedPeers((prev) => [...prev, peerId]); // Mark the peer as connected

      sendMessageToPeer(peerId);
    });

    peer.on("data", (data: any) => {
      // console.log("Received message from peer:", data.toString());
    });

    peersRef.current[peerId] = peer;
  };

  // Handle signals from other peers (responder)
  const handleSignal = (peerId: string, signal: any) => {
    let peer = peersRef.current[peerId];
    // console.log("Received signal from peer:", peerId);
    if (!peer) {
      // console.log("Creating new peer object for", peerId);
      peer = new Peer({ initiator: false, trickle: false });

      peer.on("signal", (signal: any) => {
        // console.log("Inside handle signal on Signal", myId.current, signal);
        wsRef.current?.send(
          JSON.stringify({
            type: "signal",
            signal,
            id: myId.current,
            target: peerId,
          })
        );
      });

      peer.on("connect", () => {
        //  console.log("Connected to peer:", peerId);
        setConnectedPeers((prev) => [...prev, peerId]);
      });

      peer.on("data", (data: any) => {
        //    console.log("Received message from peer:", data.toString());

        const parsedData = JSON.parse(data.toString());
        if (parsedData.type === "syncNotes") {
          manageNotesSync(parsedData.data);

          handleClose();
          if (wsRef.current) {
            wsRef.current.send(
              JSON.stringify({
                type: "sync-complete",
                targetPeer: peerId,
                selfPeerId: myId.current,
              })
            );
          }
        }
      });

      peer.on("error", (error: any) => {
        console.log("Peer error:", error);
        setDataRecieved();
      });

      peersRef.current[peerId] = peer;
    }
    //console.log("Forwarding signal to peer:", peerId, signal);
    peer.signal(signal);
  };

  // Send a message to a peer
  const sendMessageToPeer = (peerId: string) => {
    const peer = peersRef.current[peerId];
    if (peer && peer.connected) {
      const notes = localStorage.getItem("notes");
      const mesage = { type: "syncNotes", data: notes };
      peer.send(JSON.stringify(mesage)); // Send the message via WebRTC
      // console.log(`Sent message to peer ${peerId}: ${notes}`);
    } else {
      //console.log(`Cannot send message, peer ${peerId} is not connected.`);
    }
  };

  const getAvailablePeers = () => {
    return peers
      .filter(
        (obj, index, self) => index === self.findIndex((o) => o.id === obj.id)
      )
      .map((peer) => (
        <div id="peer_wrapper" key={peer.id}>
          <RandomAvatar key={peer.id} onClick={() => connectToPeer(peer.id)} />
          <span>{peer.id}</span>
        </div>
      ));
  };

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100vh",
        background: "white",
        zIndex: "1000",
        textAlign: "center",
      }}
    >
      <div id="ripples_wrapper">
        <div className="circles">
          <div className="circle1"></div>
          <div className="circle2"></div>
          <div className="circle3"></div>
        </div>
        {myId.current && myId.current != null && (
          <div id="myavatar">
            <RandomAvatar />
            <b> You ({myId.current}) </b>
          </div>
        )}
      </div>
      <button id="closeShareMenu" onClick={() => handleClose()}>
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
              d="M19 5L5 19M5.00001 5L19 19"
              stroke="#7b7777"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>{" "}
          </g>
        </svg>
      </button>
      <p style={{ marginTop: "100px", fontWeight: "600" }}>
        Click on available peers to sync notes with.
      </p>
      {/* <h1>My ID: {myId.current}</h1>
      <h2>Available Peers:</h2> */}
      {<div id="peerAvatars">{getAvailablePeers()}</div>}
      {/* <ul>
        {peers.map((peer) => (
          <>
            <li key={peer.id} id={peer.id}>
              Peer {peer.id} {peer.id}
              <button onClick={() => connectToPeer(peer.id)}>
                {connectedPeers.includes(peer.id) ? "Connected" : "Connect"}
              </button>
            </li>
            <RandomAvatar
              key={peer.id}
              onClick={() => connectToPeer(peer.id)}
            />
          </>
        ))}
      </ul> */}

      {/* <h2>Send Message:</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={() =>
          connectedPeers.forEach((peerId) =>
            sendMessageToPeer(peerId.toString())
          )
        }
      >
        Send to All Connected Peers
      </button> */}
    </div>
  );
};
