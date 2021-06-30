const express = require("express");
const router = express.Router();
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");
var dbClass = require("./DbClass");
require("date-utils");
db = new dbClass();

// create application/json parser
// var jsonParser = require('body-parser').json();

router.post("/signIn", express.json(), function (req, res, next) {
  var loginId = req.body.loginId;
  var password = req.body.password;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        poolConn.release(); //pool 반환처리
      }
      console.log("connection error");
      // callback();
      return;
    }

    console.log("데이터베이스 연결 스레드 아이디" + poolConn.threadId);

    var tablename = "USER_TABLE";
    var columns = ["user_id", "name"];

    //id 와 pw 가 같은것을 조회한다
    var exec = poolConn.query(
      "select ?? from ?? where login_id = ? and password=?",
      [columns, tablename, loginId, password],

      function (err, rows) {
        poolConn.release(); //pool 반환처리
        console.log("실행된 ssql : " + exec.sql);

        if (err) {
          // callback(err, null);
          console.log("error");
          console.log(err);
          return;
        }

        if (rows.length > 0) {
          console.log("사용자 찾음");
          var string = JSON.stringify(rows);
          var json = JSON.parse(string);
          console.log(json[0].user_id);
          res.json({ userId: json[0].user_id });
          //socket.emit("login", json[0].user_id);
        } else {
          console.log("사용자 찾지 못함");
          //socket.emit("login", -1);
          // callback(null, null);
          res.json({});
        }
      }
    );
  });
});

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

          if (result.length == 0) {
            return poolConn.rollback(function () {
              res.send({ response: "not_exist" }).status(200);
            });
          }

          roomId = result[0].room_id;
          console.log(result);
          console.log("id :" + roomId);

          // participant 데이터 검색(이미 있는 참가자인지 확인)
          var participant_data = [userId, roomId];
          var exec2 = poolConn.query(
            "select count(*) as count from PARTICIPANT_TABLE WHERE user_id=? and room_id=?",
            participant_data,
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

              console.log(result);
              participantCheck = result[0].count;
              console.log("check: " + participantCheck);

              if (participantCheck == 0) {
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
                        //throw err;
                      });
                    }

                    // 성공 시 commit
                    poolConn.commit(function (err) {
                      if (err) {
                        return poolConn.rollback(function () {
                          //throw err;
                        });
                      }
                    });

                    // 성공메세지 response
                    res.send({ response: "true" }).status(200);
                  }
                );
              } else {
                res.send({ response: "duplicate" }).status(200);
              }
            }
          );
        }
      );

      // connection release
      poolConn.release();
    });
  });
});

router.post("/roomEdit", express.json(), function (req, res) {
  var newRoomName = req.body.roomName;
  var newRoomPassword = req.body.roomPass;
  var roomName = req.body.room;
  var roomId = -1;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        // error 시 connection release
        poolConn.release();
      }

      return;
    }

    console.log("roomEdit 부분 roomName: " + roomName);
    // Transaction (query를 중첩구조로 실행함)
    poolConn.beginTransaction(function (err) {
      // RoomId 찾기
      var exec = poolConn.query(
        "select room_id from CHAT_ROOM_TABLE WHERE name=?",
        roomName,
        function (err, result) {
          console.log("roomId 찾기 실행된 SQL : " + exec.sql);

          if (err) {
            console.log("sql 실행 시 에러 발생");

            res.send({ response: "false" }).status(200);
            // 실패 시 rollback
            return poolConn.rollback(function () {
              throw err;
            });
          }
          if (result.length == 0) {
            return poolConn.rollback(function () {
              res.send({ response: "not_exist" }).status(200);
            });
          }
          roomId = result[0].room_id;
          console.log("roomId: " + roomId);

          var newRoomData = [newRoomName, newRoomPassword, roomId];

          var exec2 = poolConn.query(
            "update CHAT_ROOM_TABLE set name=?, password=? where room_id=?",
            newRoomData,
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

router.post("/exitRoom", express.json(), function (req, res) {
  var roomName = req.body.room;
  var userId = req.body.userId;

  db.getPool().getConnection(function (err, poolConn) {
    if (err) {
      if (poolConn) {
        // error 시 connection release
        poolConn.release();
      }

      return;
    }

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
          if (result.length == 0) {
            return poolConn.rollback(function () {
              res.send({ response: "not_exist" }).status(200);
            });
          }
          roomId = result[0].room_id;
          console.log("roomId: " + roomId);

          var exit_data_set = [roomId, userId];

          var exec2 = poolConn.query(
            "delete from PARTICIPANT_TABLE where room_id=? and user_id=?",
            exit_data_set,
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
          if (result.length == 0) {
            return poolConn.rollback(function () {
              res.send({ response: "not_exist" }).status(200);
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
