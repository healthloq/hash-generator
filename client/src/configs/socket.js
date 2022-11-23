import { io } from "socket.io-client";

export const socket = io(process.env.REACT_APP_API_BASE_URL, {
  auth: {
    token: process.env.JWT_TOKEN,
  },
  transports: ["websocket"],
});
