const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(router);

var mySql = require('mysql');

//connection 은 한정되어 있어서 풀을 만들어 그 안에서 사용한다
//connection 할때도 비용이 들어감, 만들고 닫고

var pool = mySql.createPool({
  connectionLimit: 10,            //접속을 10개 만들고 10개를 재사용
  host: 'chat-db.czkuabyjl3ag.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: '12345678',   //MySql 설치할때의 비번을 입력하면 됨!!
  database: 'chat_db',
  debug: false
});


io.on('connect', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    console.log("user.room : " + user.room)

    if (error) return callback(error);

    socket.join(user.room);

    socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

    io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });


    pool.getConnection(function (err, poolConn) {
      if (err) {
        if (poolConn) {
          poolConn.release();     //pool 반환처리
        }
        console.log('connection error');
        // callback();
        return;
      }

      console.log('데이터베이스 연결 스레드 아이디' + poolConn.threadId);

      var tablename = 'USER_TABLE';
      var columns = ['_id', 'name'];


      //id 와 pw 가 같은것을 조회한다
      var exec = poolConn.query("select ?? from ?? where login_id = ? and password=?", [columns, tablename, name, room],

        function (err, rows) {
          poolConn.release();     //pool 반환처리
          console.log('실행된 ssql : ' + exec.sql);

          if (err) {
            // callback(err, null);
            console.log('error');
            return;
          }

          if (rows.length > 0) {
            console.log('사용자 찾음');
            // callback(null, rows);
            socket.emit('login', 'true');
          } else {
            console.log('사용자 찾지 못함');
            socket.emit('login', 'false');
            // callback(null, null);
          }

        }
      );

    }
    );

    console.log(name);
    console.log(room);

    // front 에서 callback 함수를 보내줌
    callback();
  });

  socket.on('signUp', (sign_name, sign_id, sign_password) => {
    pool.getConnection(
      function (err, poolConn) {
        if (err) {
          if (poolConn) {
            poolConn.release();        // 사용한후 해제(반납)한다
          }
          // callback(err, null);
          return;
        }
        console.log('데이터베이스 연결 스레드 아이디' + poolConn.threadId);
        var data = { login_id: sign_id, name: sign_name, password: sign_password };

        //users 테이블에 데이터 추가
        var exec = poolConn.query('insert into USER_TABLE set ?', data,
          function (err, result) {
            poolConn.release();
            console.log('실행된 SQL : ' + exec.sql);

            if (err) {
              console.log('sql 실행 시 에러 발생');
              // callback(err, null);
              return;
            }

            // callback(null, result);
          }
        );
      }
    );
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
      io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
    }
  })
});

server.listen(process.env.PORT || 5000, () => console.log(`Server has started.`));