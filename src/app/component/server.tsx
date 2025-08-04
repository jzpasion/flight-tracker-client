import { io } from "socket.io-client";

export const socket = io("http://100.64.1.25:8000", {
  autoConnect: false,
});
