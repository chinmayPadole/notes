const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 }); // Port 8080 on Glitch

let clients = [];

wss.on('connection', (ws) => {
	// Add new client
	const id = Math.random().toString(36).substring(2, 15); // Generate peerId
	clients.push({ id, ws });

	// Send the list of connected peers to the new client
	ws.send(
		JSON.stringify({
			type: 'peer-list',
			selfId: id,
			peers: clients.filter((client) => client.id !== id).map((client) => client.id),
		})
	);

	// Notify other clients about the new peer
	clients.forEach((client) => {
		if (client.ws !== ws) {
			client.ws.send(JSON.stringify({ type: 'new-peer', id }));
		}
	});

	// Handle incoming messages
	ws.on('message', (message) => {
		const data = JSON.parse(message);

		// Relay WebRTC signaling data (offer/answer/ice candidates)
		if (data.type === 'signal') {
			const target = clients.find((client) => client.id === data.target);
			if (target) {
				target.ws.send(
					JSON.stringify({
						type: 'signal',
						id: data.id,
						signal: data.signal,
					})
				);
			}
		} else if (data.type === 'delete') {
			clients = clients.filter((client) => client.id !== data.id);
		} else if (data.type === 'sync-complete') {
			clients = clients.filter((client) => client.id !== data.id);

			const target = clients.find((client) => client.id === data.targetPeer);
			if (target) {
				target.ws.send(
					JSON.stringify({
						type: 'sync-complete',
						id: data.id,
						fromPeer: data.selfPeerId,
					})
				);
			}
		}
	});

	// Handle client disconnect
	ws.on('close', () => {
		clients = clients.filter((client) => client.ws !== ws);
		// Notify remaining clients about peer disconnection
		clients.forEach((client) => {
			client.ws.send(JSON.stringify({ type: 'peer-disconnected', id }));
		});
	});
});
