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

// var mySql = require('mysql');

// //connection 은 한정되어 있어서 풀을 만들어 그 안에서 사용한다
// //connection 할때도 비용이 들어감, 만들고 닫고

// var pool = mySql.createPool({
//   connectionLimit: 10,            //접속을 10개 만들고 10개를 재사용
//   host: 'chat-db.czkuabyjl3ag.ap-northeast-2.rds.amazonaws.com',
//   user: 'admin',
//   password: '12345678',   //MySql 설치할때의 비번을 입력하면 됨!!
//   database: 'chat_db',
//   debug: false
// });


function getIo() {
  return io;
}


io.on("connect", (socket) => {
  socket.on("join", ({ userId, roomname }, callback) => {
    const { error, user } = addUser({ id: socket.id, userId, room });
    console.log(error);
    if (error) return callback("error");
  });

  socket.on("roomJoin", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log("user.room : " + user.room);

    if (error) return callback(error);

    socket.join(user.room);
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to room ${user.room}.`,
    });

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

    console.log("sendMessage : " + room);
    // io.to(room).emit("message", { user: name, text: message });
    socket.emit("message", { user: name, text: message });

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



module.exports = {
  getIo: getIo
};

server.listen(process.env.PORT || 5000, () =>
  console.log(`Server has started.`)
);