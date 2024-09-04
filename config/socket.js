const userSocketMap = {};
export const socketConfig = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (
      typeof userId === "string" &&
      userId !== "undefined" &&
      userId !== null
    ) {


      userSocketMap[userId] = socket.id;
      
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      if (
        typeof userId === "string" &&
        userId !== "undefined" &&
        userId !== null
      ) {
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getRecieverSocketId = (reciever) => {
  return userSocketMap[reciever];
};

export default socketConfig;
