const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");
const {
  storeUser,
  userLeave,
  getRoomUsers,
  getCurrentUser,
} = require("./users/users.js");
const moment = require("moment");

const app = express();
const port = process.env.PORT || 4500;

const users = [{}];
const hbeat = [];

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hell its working");
});

const server = http.createServer(app);

const io = socketIO(server);

io.on("connection", (socket) => {
  // console.log("New Connection");

  socket.on("roomJoined", ({ user, room }) => {
    const id = socket.id;
    // store the user
    storeUser({ user, id, room });

    // client joined this room
    socket.join(room);

    // welcoming user
    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the chat ${user}`,
      action: "welcome",
    });

    //  broadcasting other users in that room

    socket.broadcast.to(room).emit("userJoined", {
      user: "Admin",
      message: `${user} has joined`,
      action: "join",
    });

    // Send users and room info
    io.to(room).emit("roomUsers", {
      room: room,
      users: getRoomUsers(room),
    });
  });

  socket.on("message", ({ message, id, room }) => {
    io.to(room).emit("sendMessage", {
      user: getCurrentUser(id).user,
      message,
      id,
      time: moment().utcOffset("+05:30").format("h:mm a"),
    });
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit("leave", {
        user: "Admin",
        message: `${user.user} has left`,
        action: "leave",
      });

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
