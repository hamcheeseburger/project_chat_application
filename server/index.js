const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom, removeUserByName } = require("./users");
const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

var dbClass = require("./DbClass");
db = new dbClass();
//,,,,,,


// 소켓이 connect 되면 client의 소켓 객체를 callback으로 받는다
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

    // 사용자 소켓이 join됨
    socket.join(user.room);

    console.log("checkpoint");

    // 나를 제외한 모두에게 broadcast
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });
    // 나를 포함한 모두에게 
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

  });

  socket.on("sendMessage", ({ message, name, room }, callback) => {
    const user = getUser(socket.id);

    console.log("room : " + room);
    console.log("name : " + user.name);
    // 나를 포함한 모두에게 
    io.to(room).emit("message", { user: name, text: message });

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

  socket.on("exit", ({ room, name }) => {

    const user = removeUserByName(room, name);
    console.log("exit : " + user);
    console.log("user name : " + user.name);
    console.log("user room : " + user.room);
    if (user) {
      socket.emit("exit", {});

      socket.broadcast.to(user.room).emit("adminmessage", {
        user: "Admin",
        text: `${user.name} has left.`,
        room: user.room
      });

      socket.broadcast.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

});

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);