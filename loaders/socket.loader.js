const socketIO = require("socket.io");
const messageModel = require("../models/message.model");

function setupSocket(server) {
  console.log("🚀 Initializing Socket.IO...");

  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000", 
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  global.io = io;

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);
    socket.on('send_message', async(data) => {

      console.log("📩 Message received:", data);
      const newMsg = new messageModel(data)
      await newMsg.save();

      io.emit('receive_message', newMsg);
      console.log("📤 Message sent to all clients:", newMsg);
    });
    
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
  console.log("✅ Socket.IO setup complete!");
}

module.exports = setupSocket ;
