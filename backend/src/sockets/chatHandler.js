export const chatHandler = (socket, io) => {
  socket.on("send_message", ({ roomId, message, role }) => {
    if (!roomId || !message) return;
    io.to(roomId).emit("receive_message", {
      text: message,
      senderRole: role,
    });
  });
};