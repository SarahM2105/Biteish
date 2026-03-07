let io = null;

function initSocket(server){
    const { Server } = require ('socket.io');
    io = new Server (server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: true,
        },
    });
    io.on("connection", socket => {
        socket.on("join",({role, userId}) =>{
            if (role) socket.join(`role:${role}`);
            if (userId) socket.join(`user:${userId}`);
        });
        socket.on("disconnect", socket => {});
    });
    return io;
}
function getIO() {
    if (!io) throw new Error("socket not initialised");
      return io;
}

module.exports = { initSocket, getIO}