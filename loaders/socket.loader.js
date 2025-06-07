const { Server } = require("socket.io");

const userSocketMap = {};

let ioInstance = null;

function setupSocket(server) {
  console.log("🚀 Initializing Socket.IO...");

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log("📌 userSocketMap updated:", userSocketMap);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("❌ A user disconnected:", socket.id);

      if (userId && userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
}

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

module.exports = {
  setupSocket,
  getReceiverSocketId,
  getIo: () => ioInstance, 
};
