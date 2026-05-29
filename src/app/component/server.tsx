import { io } from "socket.io-client";

const host = "100.64.1.25";
const local = "localhost";

export const socket = io(`http://${local}:8000`, {
  autoConnect: false,
});
