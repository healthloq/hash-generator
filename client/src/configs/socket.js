import { io } from "socket.io-client";

export const socket = io.connect(process.env.REACT_APP_API_BASE_URL, {
  auth: { token: process.env.REACT_APP_JWT_TOKEN },
});

// export const socket = io(process.env.REACT_APP_API_BASE_URL, {
//   auth: {
//     token: process.env.REACT_APP_JWT_TOKEN,
//   },
//   transports: ["websocket"],
// });
