const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

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
  console.log("New Connection");

  socket.on("joined", ({ user }) => {
    users[socket.id] = user;
    console.log(`${user} has joined`);
    socket.broadcast.emit("userJoined", {
      user: "Admin",
      message: `${users[socket.id]} has joined`,
      action: "join",
    });
    socket.emit("welcome", {
      user: "Admin",
      message: `Welcome to the chat ${users[socket.id]}`,
      action: "welcome",
    });
  });

  socket.on("message", ({ message, id }) => {
    io.emit("sendMessage", {
      user: users[id],
      message,
      id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} left`);
    socket.broadcast.emit(`leave`, {
      user: "Admin",
      message: `${users[socket.id]} has left`,
      action: "leave",
    });
  });
});

server.listen(port, () => {
  console.log(`server is working on http://localhost:${port}`);
});
