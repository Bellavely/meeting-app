import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: null,
  },
  transports: ["polling", "websocket"],
});

export const connectSocket = (token: string) => {
  if (!token) {
    console.log("Token is not ready yet.");
    return;
  }
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
    console.log("Connected to WebSocket server.");
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Disconnected from WebSocket server.");
  }
};


