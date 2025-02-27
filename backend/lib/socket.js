import {Server} from 'socket.io';
import http from 'http';
import express from "express";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors : ['http://localhost:5173']
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

//storing online users
const userSocketMap = {}; // {userId : socketId}

io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) {
        userSocketMap[userId] = socket.id;
    }

    //getting all online users
    io.emit("getAllOnlineUsers", Object.keys(userSocketMap));// Here we are sending keys to the frontend

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getAllOnlineUsers", Object.keys(userSocketMap));
    })
})

export {io, app, server};