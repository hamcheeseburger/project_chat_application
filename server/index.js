const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

var dbClass = require("./DbClass");
db = new dbClass();
//,,,,,,



io.on("connect", (socket) => {
  socket.on("roomJoin", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (user === undefined) return;
    console.log("user.name : " + user.name);
    console.log("user.room : " + user.room);
    console.log("socket.id : " + socket.id);
    if (error) {
      console.log(error);
    };

    socket.join(user.room);

    //socket.emit("message", { user: "admin", text: `${user.name}, welcome to room ${user.room}.` });

    console.log("checkpoint");

    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

  });

  socket.on("sendMessage", ({ message, name, room }, callback) => {
    const user = getUser(socket.id);

    console.log("room : " + room);
    console.log("name : " + user.name);
    io.to(room).emit("message", { user: name, text: message });
    //socket.emit("message", { user: name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);