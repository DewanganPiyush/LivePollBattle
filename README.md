
# 🗳️ Live Poll Battle

A real-time voting application where users can create or join poll rooms and cast their vote for either **Cats** or **Dogs**. The results update live across all participants using WebSockets.

---

## 🛠️ Tech Stack

- **Frontend**: ReactJS + Vite + Tailwind
- **Backend**: Node.js + WebSockets (`ws`)
- **State Storage**: In-memory (no database)

---

## 📁 Project Structure

```
LivePollBattle/
├── client/         # React frontend
│   └── src/
│       └── App.jsx
├── server/         # Node.js WebSocket backend
│   └── index.js
└── README.md       # Project documentation
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/live-poll-battle.git
cd live-poll-battle
```

### 2. Start Backend

```bash
cd server
npm install
npm start
```

Runs at: `ws://localhost:8080`

### 3. Start Frontend

```bash
cd ../client
npm install
npm run dev
```

Runs at: `http://localhost:5173`

---

## ✨ Features Implemented

### 🎨 Frontend (React)

- Input a unique username and enter room code or create a new room
- Display question: **Cats vs Dogs?**
- Two vote buttons (Cats / Dogs)
- Only one vote allowed per user (enforced by `localStorage` and backend)
- Real-time vote count updates
- 60-second countdown timer after poll starts
- Voting automatically ends after 60 seconds
- Displays total votes and user’s selection

### 🔌 Backend (WebSockets + Node.js)

- Create and join rooms using a 6-character room code
- Track vote counts and users in memory (no DB)
- Prevent duplicate voting per user
- Broadcast updated vote counts to room members
- Start and broadcast a 60-second countdown
- End poll automatically after timeout

---

## 🧠 Vote State & Room Management Design

The backend maintains an in-memory `rooms` object:
```js
rooms = {
  [roomCode]: {
    users: {
      [username]: WebSocketConnection
    },
    votes: { A: 0, B: 0 },
    hasEnded: false
  }
}
```

- When a user joins a room, they are added to the `users` map for that room.
- Votes are stored under `A` and `B`.
- Once a vote is cast, the user is marked as voted and future votes are blocked.
- Timer starts via a `START_TIMER` message and uses `setTimeout()` to auto-end poll.
- Updates are broadcasted to all users using WebSocket `send`.

The frontend stores the user’s vote in `localStorage` to prevent double-voting across refreshes, and the backend also validates votes.

---

## 🧪 Example Flow

1. Enter your name → Create or join a room
2. Vote for Cats or Dogs
3. Click “Start Poll” to begin countdown
4. Votes update live
5. Poll ends automatically after 60 seconds

---




