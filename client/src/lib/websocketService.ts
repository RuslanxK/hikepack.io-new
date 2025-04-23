import { io, Socket } from "socket.io-client";

let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_REACT_APP_API!, {
      withCredentials: true,
      transports: ["websocket"], // ✅ force WebSocket only
      upgrade: false, // ❌ disable fallback to polling (helps avoid CORS/cookie issues)
    });

    // ✅ Optional: listen for connection errors
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};
