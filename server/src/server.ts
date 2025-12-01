// src/server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import app, { FRONTEND_URLS } from "./app";
import setupSocket from "./socket";

const PORT = Number(process.env.PORT) || 5000;

const server = createServer(app);

const io = new Server(server, {
  // Use a function-style CORS check to mirror Express behaviour
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/+$/, "");
      if (FRONTEND_URLS.includes(normalized)) return callback(null, true);
      console.warn("Socket CORS blocked origin:", origin, "normalized:", normalized);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Keep the default path but define explicitly for clarity
  path: "/socket.io",
  // If you want to limit to websocket only in prod, set transports; for now allow both
  transports: ["websocket", "polling"],
});

const { emitOrderUpdate } = setupSocket(io);
app.locals.emitOrderUpdate = emitOrderUpdate;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Socket server ready");
});
