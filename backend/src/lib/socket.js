import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.userId = userId;
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // 📞 CALL USER (send offer)
  socket.on("call-user", ({ to, offer }) => {
    const receiverSocketId = getReceiverSocketId(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        from: userId,
        offer,
      });
    }
  });

  // ✅ ANSWER CALL
  socket.on("answer-call", ({ to, answer }) => {
    const callerSocketId = getReceiverSocketId(to);

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-answered", {
        answer,
      });
    }
  });

  // 🔁 ICE CANDIDATES (network connection data)
  socket.on("ice-candidate", ({ to, candidate }) => {
    const receiverSocketId = getReceiverSocketId(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ice-candidate", candidate);
    }
  });

  // 🔴 END CALL
  socket.on("end-call", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended");
    }
  });

  // ❌ CALL REJECTED
  socket.on("call-rejected", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-rejected");
    }
  });  
});

export { io, app, server };