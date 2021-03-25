const express = require("express");
const router = express.Router();

var dbClass = require('./DbClass');
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

  db.getPool().getConnection(
    function (err, poolConn) {
      if (err) {
        if (poolConn) {
          poolConn.release();        // 사용한후 해제(반납)한다
        }
        // callback(err, null);
        return;
      }
      console.log('데이터베이스 연결 스레드 아이디' + poolConn.threadId);
      var data = { login_id: signloginId, name: signname, password: signpassword };

      //users 테이블에 데이터 추가
      var exec = poolConn.query('insert into USER_TABLE set ?', data,
        function (err, result) {
          poolConn.release();
          console.log('실행된 SQL : ' + exec.sql);

          if (err) {
            console.log('sql 실행 시 에러 발생');
            // callback(err, null);
            res.send({ response: "false" }).status(200);
            return;
          }
          res.send({ response: "true" }).status(200);
        }
      );

    }
  );
});

module.exports = router;