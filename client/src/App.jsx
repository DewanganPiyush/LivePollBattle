// client/src/App.jsx
import React, { useEffect, useState, useRef } from "react";

const socket = new WebSocket("ws://localhost:8080");

function App() {
    const [username, setUsername] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [vote, setVote] = useState(localStorage.getItem("vote"));
    const [votes, setVotes] = useState({ A: 0, B: 0 });
    const [joined, setJoined] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        socket.onmessage = (msg) => {
            const { type, payload } = JSON.parse(msg.data);
            switch (type) {
                case "ROOM_CREATED":
                    setRoomCode(payload.roomCode);
                    break;
                case "JOINED_ROOM":
                    setVotes(payload.votes);
                    setHasEnded(payload.hasEnded);
                    setJoined(true);
                    break;
                case "VOTE_UPDATE":
                    setVotes(payload);
                    break;
                case "TIMER_START":
                    setTimeLeft(payload.duration);
                    break;
                case "TIMER_END":
                    setHasEnded(true);
                    setTimeLeft(0);
                    break;
                case "ERROR":
                    alert(payload);
                    break;
                default:
                    break;
            }
        };
    }, []);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) clearInterval(timerRef.current);
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timeLeft]);

    const handleCreate = () => {
        if (!username) return alert("Enter a username");
        socket.send(JSON.stringify({ type: "CREATE_ROOM" }));
    };

    const handleJoin = () => {
        if (!username || !roomCode) return alert("Enter username and room code");
        socket.send(JSON.stringify({ type: "JOIN_ROOM", payload: { roomCode, username } }));
    };

    const castVote = (option) => {
        if (vote || hasEnded) return;
        socket.send(JSON.stringify({ type: "CAST_VOTE", payload: { vote: option } }));
        localStorage.setItem("vote", option);
        setVote(option);
    };

    const startTimer = () => {
        socket.send(JSON.stringify({ type: "START_TIMER", payload: { roomCode } }));
    };

    if (!joined) {
        return (
            <div className="p-8 max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold mb-4">Live Poll Battle</h1>
                <input className="border p-2 mb-2 w-full" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                <div className="flex gap-2 mb-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCreate}>
                        Create Room
                    </button>
                    <input className="border p-2 w-full" placeholder="Room Code" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
                    <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleJoin}>
                        Join Room
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Room: {roomCode}</h1>
            <p className="mb-4">
                Question: <strong>Cats vs Dogs?</strong>
            </p>
            {hasEnded ? (
                <p className="text-red-500 font-bold mb-4">Voting ended!</p>
            ) : vote ? (
                <p className="text-green-600 font-semibold mb-4">You voted for: {vote}</p>
            ) : (
                <div className="flex gap-4 justify-center mb-4">
                    <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={() => castVote("A")}>
                        Cats
                    </button>
                    <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => castVote("B")}>
                        Dogs
                    </button>
                </div>
            )}
            <div className="mb-4">
                <p>
                    Cats: {votes.A} | Dogs: {votes.B}
                </p>
            </div>
            {timeLeft !== null && <p className="text-sm text-gray-600">Time left: {timeLeft}s</p>}
            {!hasEnded && timeLeft === null && (
                <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={startTimer}>
                    Start Poll
                </button>
            )}
        </div>
    );
}

export default App;
