import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { setupEditorSync } from "./sockets/editorHandler.js";
import { registerSocketHandlers } from "./sockets/index.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://mentor-platform-coral.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://mentor-platform-coral.vercel.app",
    ],
    credentials: true,
  },
});

setupEditorSync(io);
registerSocketHandlers(io);

app.use("/api/users", userRoutes);
app.get("/", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
