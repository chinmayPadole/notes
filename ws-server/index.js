const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

// Map to store active sessions, each session ID maps to an array of WebSocket connections
const sessions = new Map();

server.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const { sessionId, type, payload } = data;
      if (type === "init") {
        // Initialize or add to session
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, []);
        }
        if (!sessions.get(sessionId).includes(ws)) {
          sessions.get(sessionId).push(ws);
        }
        console.log(`Session ${sessionId} initialized or updated`);
      } else if (type === "data" && sessions.has(sessionId)) {
        // Broadcast data to all peers in the session except the sender
        const peers = sessions.get(sessionId);

        console.log(peers.length);
        peers.forEach((peerWs) => {
          if (peerWs !== ws && peerWs.readyState === WebSocket.OPEN) {
            peerWs.send(JSON.stringify({ type: "data", payload }));
          }
        });
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    // Remove closed connection from all sessions
    for (const [key, peers] of sessions.entries()) {
      const index = peers.indexOf(ws);
      if (index !== -1) {
        peers.splice(index, 1);
        console.log(`Session ${key} updated`);
        // If the session has no more connections, delete the session
        if (peers.length === 0) {
          sessions.delete(key);
          console.log(`Session ${key} closed`);
        }
        break;
      }
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.on("listening", () => {
  console.log("WebSocket server is running on ws://localhost:8080");
});

server.on("error", (err) => {
  console.error("WebSocket server error:", err);
});
