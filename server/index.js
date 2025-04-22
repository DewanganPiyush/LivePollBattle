// server/index.js
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 8080 });

const rooms = {}; // In-memory store for rooms and their state

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            const { type, payload } = data;

            switch (type) {
                case "CREATE_ROOM": {
                    const roomCode = uuidv4().slice(0, 6);
                    rooms[roomCode] = {
                        users: {},
                        votes: { A: 0, B: 0 },
                        hasEnded: false,
                    };
                    ws.send(JSON.stringify({ type: "ROOM_CREATED", payload: { roomCode } }));
                    break;
                }

                case "JOIN_ROOM": {
                    const { roomCode, username } = payload;
                    const room = rooms[roomCode];

                    if (!room || room.users[username]) {
                        ws.send(JSON.stringify({ type: "ERROR", payload: "Invalid room or user exists" }));
                        return;
                    }

                    ws.roomCode = roomCode;
                    ws.username = username;
                    room.users[username] = ws;

                    ws.send(JSON.stringify({ type: "JOINED_ROOM", payload: { roomCode, votes: room.votes, hasEnded: room.hasEnded } }));
                    break;
                }

                case "CAST_VOTE": {
                    const { vote } = payload;
                    const room = rooms[ws.roomCode];
                    if (!room || room.hasEnded || room.users[ws.username].hasVoted) return;

                    if (vote === "A" || vote === "B") {
                        room.votes[vote]++;
                        room.users[ws.username].hasVoted = true;

                        broadcast(ws.roomCode, {
                            type: "VOTE_UPDATE",
                            payload: room.votes,
                        });
                    }
                    break;
                }

                case "START_TIMER": {
                    const { roomCode } = payload;
                    const room = rooms[roomCode];

                    if (!room || room.hasEnded) return;

                    broadcast(roomCode, { type: "TIMER_START", payload: { duration: 60 } });

                    setTimeout(() => {
                        room.hasEnded = true;
                        broadcast(roomCode, { type: "TIMER_END" });
                    }, 60000);

                    break;
                }

                default:
                    break;
            }
        } catch (err) {
            ws.send(JSON.stringify({ type: "ERROR", payload: "Invalid message format" }));
        }
    });

    ws.on("close", () => {
        const { roomCode, username } = ws;
        if (roomCode && username && rooms[roomCode]) {
            delete rooms[roomCode].users[username];
        }
    });
});

function broadcast(roomCode, message) {
    const room = rooms[roomCode];
    if (!room) return;
    Object.values(room.users).forEach((userWs) => {
        if (userWs.readyState === WebSocket.OPEN) {
            userWs.send(JSON.stringify(message));
        }
    });
}

console.log("WebSocket server running on ws://localhost:8080");
