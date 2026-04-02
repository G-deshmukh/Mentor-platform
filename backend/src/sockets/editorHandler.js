import { YSocketIO } from "y-socket.io/dist/server";

export const setupEditorSync = (io) => {
  const ysocketio = new YSocketIO(io, {
    gcEnabled: true,
  });
  ysocketio.initialize();
};
