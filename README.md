# Zynk
A simplified video conferencing web application inspired by Zoom. This project demonstrates real-time video, audio, and messaging functionality using WebRTC and Socket.IO.

## 🚀 Features

- 📹 Real-time video and audio communication
- 💬 Live text chat between participants
- 👤 Join rooms using unique Room IDs
- ⚡ Peer-to-peer connections with WebRTC
- 🔌 Socket.IO integration for signaling

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO, WebRTC
- **UUID**: For generating unique room IDs
- **PeerJS**: Simplified WebRTC peer-to-peer connection handling

## 🧑‍💻 Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm (comes with Node)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ShishirSuman999/Zynk.git
   cd Zynk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open in your browser:
   ```
   http://localhost:3000
   ```

## 🌐 Usage

- Open the app in your browser.
- Click on the **New Meeting** button to create a new room.
- Share the Room ID with your friends.
- They can join using the **Join Meeting** field.

## 🧩 Folder Structure

```
Zynk/
├── public/              # Static assets (CSS, JS, images)
│   └── script.js
├── views/               # EJS templates
│   └── room.ejs
├── server.js            # Main server file
├── package.json         # Project metadata and dependencies
```

## 📦 Dependencies

- `express`
- `ejs`
- `uuid`
- `socket.io`
- `peer`

## 💡 Learning Goals

- Understand WebRTC for peer-to-peer communication
- Implement signaling using Socket.IO
- Use PeerJS to simplify WebRTC connections
- Learn full-stack integration of real-time apps
