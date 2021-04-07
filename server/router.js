const express = require("express");
const router = express.Router();
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
var dbClass = require("./DbClass");
require("date-utils");
db = new dbClass();

// create application/json parser
// var jsonParser = require('body-parser').json();

router.get("/", (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});

// body-parser 대체로 express.json() 사용
router.post("/signUp", express.json(), function (req, res, next) {
  console.log("router sign up");
  var signloginId = req.body.loginId;
  var signpassword = req.body.password;
  var signname = req.body.name;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        poolConn.release(); // 사용한후 해제(반납)한다
      }
      // callback(err, null);
      return;
    }
    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);
    var data = {
      login_id: signloginId,
      name: signname,
      password: signpassword,
    };

    //users 테이블에 데이터 추가
    var exec = poolConn.query(
      "insert into USER_TABLE set ?",
      data,
      function (err, result) {
        poolConn.release();
        console.log("실행된 SQL : " + exec.sql);

        if (err) {
          console.log("sql 실행 시 에러 발생");
          // callback(err, null);
          res.send({ response: "false" }).status(200);
          return;
        }
        res.send({ response: "true" }).status(200);
      }
    );
  });
});

router.post("/getChatsInRoom", express.json(), function (req, res, next) {
  // var name = req.body.name;
  var room = req.body.roomName;
  // var socketId = req.body.socketId;

  // console.log(socketId);

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        poolConn.release(); // 사용한후 해제(반납)한다
      }
      // callback(err, null);
      return;
    }
    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);

    // Room name으로 chats select
    var exec = poolConn.query(
      "SELECT u.login_id, c.chat FROM CHAT_ROOM_TABLE r, CHAT_TABLE c, USER_TABLE u WHERE r.room_id = c.room_id and c.user_id = u.user_id and r.name = ?;",
      room,
      function (err, rows) {
        poolConn.release();
        console.log("실행된 SQL : " + exec.sql);

        if (err) {
          // callback(err, null);
          return;
        }

        if (rows.length > 0) {
          console.log("Chat 찾음");

          // parse to json array
          var resultArray = Object.values(JSON.parse(JSON.stringify(rows)));
          var result = [];
          resultArray.forEach(function (item) {
            var json = {
              user: item.login_id,
              text: item.chat,
            };
            result.push(json);
          });

          console.log(result);
        } else {
          console.log("Chat 없음");
          // callback(null, null);
        }
        res.send({ rows: result }).status(200);
      }
    );
  });
});

router.post("/getRooms", express.json(), function (req, res, next) {
  console.log("router get rooms");
  var userId = req.body.userId;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        poolConn.release(); // 사용한후 해제(반납)한다
      }
      // callback(err, null);
      return;
    }
    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);
    //var data = { login_id: signloginId };

    //PARTICIPANT_TABLE에서 룸목록 찾기
    var exec = poolConn.query(
      "SELECT r.name FROM CHAT_ROOM_TABLE r, PARTICIPANT_TABLE p, USER_TABLE u WHERE r.room_id = p.room_id AND p.user_id = u.user_id AND u.user_id = ?",
      userId,
      function (err, rows) {
        poolConn.release();
        console.log("실행된 SQL : " + exec.sql);

        if (err) {
          // callback(err, null);
          return;
        }

        if (rows.length > 0) {
          console.log("room 찾음");
          console.log(rows);
          // callback(null, rows);
          // socket.emit("getrooms", rows);
          // return rows;
        } else {
          console.log("room 찾지 못함");
          // callback(null, null);
        }
        res.send({ rows: rows }).status(200);
      }
    );
  });
});

router.post("/roomAdd", express.json(), function (req, res) {
  var plusRoomName = req.body.plusRoomName;
  var plusRoomPassword = req.body.plusRoomPassword;
  var userId = req.body.userId;
  var now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  var roomId = -1;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        // error 시 connection release
        poolConn.release();
      }

      return;
    }
    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);

    // Transaction (query를 중첩구조로 실행함)
    poolConn.beginTransaction(function (err) {
      // Room 데이터 삽입
      var roomData = {
        name: plusRoomName,
        password: plusRoomPassword,
        created_date: now,
      };
      var exec = poolConn.query(
        "insert into CHAT_ROOM_TABLE set ?",
        roomData,
        function (err, result) {
          console.log("실행된 SQL : " + exec.sql);

          if (err) {
            console.log("sql 실행 시 에러 발생");

            res.send({ response: "false" }).status(200);
            // 실패시 rollback
            return poolConn.rollback(function () {
              throw err;
            });
          }

          roomId = result.insertId;
          console.log("id :" + roomId);

          // Participant 데이터 삽입
          var parcitipant_data = { user_id: userId, room_id: roomId };
          var exec2 = poolConn.query(
            "insert into PARTICIPANT_TABLE set ?",
            parcitipant_data,
            function (err, result) {
              console.log("실행된 SQL : " + exec2.sql);

              if (err) {
                console.log("sql 실행 시 에러 발생");

                res.send({ response: "false" }).status(200);
                // 실패 시 rollback
                return poolConn.rollback(function () {
                  throw err;
                });
              }

              // 성공 시 commit
              poolConn.commit(function (err) {
                if (err) {
                  return poolConn.rollback(function () {
                    throw err;
                  });
                }
              });

              // 성공메세지 response
              res.send({ response: "true" }).status(200);
            }
          );
        }
      );

      // connection release
      poolConn.release();
    });
  });
});

router.post("/roomParticipate", express.json(), function (req, res) {
  var participateRoomName = req.body.participateRoomName;
  var participateRoomPass = req.body.participateRoomPass;
  var userId = req.body.userId;
  var roomId = -1;
  var participantCheck = -1;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        // error 시 connection release
        poolConn.release();
      }

      return;
    }
    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);

    // Transaction (query를 중첩구조로 실행함)
    poolConn.beginTransaction(function (err) {
      // Room 일치 여부 확인
      var roomData = [participateRoomName, participateRoomPass];
      var exec = poolConn.query(
        "select room_id from chat_db.CHAT_ROOM_TABLE WHERE name=? and password=?",
        roomData,
        function (err, result) {
          console.log("실행된 SQL : " + exec.sql);

          if (err) {
            console.log("sql 실행 시 에러 발생");

            res.send({ response: "false" }).status(200);
            // 실패시 rollback
            return poolConn.rollback(function () {
              throw err;
            });
          }

          roomId = result[0].room_id;
          console.log(result);
          console.log("id :" + roomId);

          // participant 데이터 검색(이미 있는 참가자인지 확인)
          var participant_data = [userId, roomId];
          var exec3 = poolConn.query(
            "select count(*) as count from PARTICIPANT_TABLE WHERE user_id=? and room_id=?",
            participant_data,
            function (err, result) {
              console.log("실행된 SQL : " + exec3.sql);

              if (err) {
                console.log("sql 실행 시 에러 발생");

                res.send({ response: "false" }).status(200);
                // 실패 시 rollback
                return poolConn.rollback(function () {
                  throw err;
                });
              }

              console.log(result);
              participantCheck = result[0].count;
              console.log("check: " + participantCheck);
            }
          );

          // Participant 데이터 삽입
          var participant_data_set = { user_id: userId, room_id: roomId };
          var exec3 = poolConn.query(
            "insert into PARTICIPANT_TABLE set ?",
            participant_data_set,
            function (err, result) {
              console.log("실행된 SQL : " + exec3.sql);

              if (err) {
                console.log("sql 실행 시 에러 발생");

                res.send({ response: "false" }).status(200);
                // 실패 시 rollback
                return poolConn.rollback(function () {
                  throw err;
                });
              }

              // 성공 시 commit
              poolConn.commit(function (err) {
                if (err) {
                  return poolConn.rollback(function () {
                    throw err;
                  });
                }
              });

              // 성공메세지 response
              res.send({ response: "true" }).status(200);
            }
          );
        }
      );

      // connection release
      poolConn.release();
    });
  });
});

router.post("/chatAdd", express.json(), function (req, res) {
  var roomName = req.body.room;
  var userId = req.body.userId;
  var message = req.body.message;
  var now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  var roomId = -1;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        // error 시 connection release
        poolConn.release();
      }

      return;
    }
    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);

    console.log("roomName: " + roomName);
    // Transaction (query를 중첩구조로 실행함)
    poolConn.beginTransaction(function (err) {
      var exec = poolConn.query(
        "select room_id from CHAT_ROOM_TABLE WHERE name=?",
        roomName,
        function (err, result) {
          console.log("실행된 SQL : " + exec.sql);

          if (err) {
            console.log("sql 실행 시 에러 발생");

            res.send({ response: "false" }).status(200);
            // 실패 시 rollback
            return poolConn.rollback(function () {
              throw err;
            });
          }

          roomId = result[0].room_id;
          console.log("roomId: " + roomId);

          var chat_data_set = {
            room_id: roomId,
            user_id: userId,
            chat: message,
            created_date: now,
          };
          var exec2 = poolConn.query(
            "insert into CHAT_TABLE set ?",
            chat_data_set,
            function (err, result) {
              console.log("실행된 SQL : " + exec2.sql);

              if (err) {
                console.log("sql 실행 시 에러 발생");

                res.send({ response: "false" }).status(200);
                // 실패시 rollback
                return poolConn.rollback(function () {
                  throw err;
                });
              }

              // 성공 시 commit
              poolConn.commit(function (err) {
                if (err) {
                  return poolConn.rollback(function () {
                    throw err;
                  });
                }
              });

              // 성공메세지 response
              res.send({ response: "true" }).status(200);
            }
          );
        }
      );

      // connection release
      poolConn.release();
    });
  });
});

module.exports = router;
