import { chatHandler } from "./chatHandler.js";
import { videoHandler } from "./videoHandler.js";

export const registerSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("join_room", ({ roomId, role }) => {
      if (!roomId || !role) return;
      socket.join(roomId);
      socket.role = role;
      socket.roomId = roomId;
      socket.to(roomId).emit("user_joined", { role });
    });

    socket.on("cursor-move", ({ roomId, x, y }) => {
      socket.to(roomId).emit("cursor-update", { x, y, userId: socket.id });
    });

    chatHandler(socket, io);
    videoHandler(socket);

    socket.on("disconnect", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("cursor-remove", socket.id);
      }
    });
  });
};
