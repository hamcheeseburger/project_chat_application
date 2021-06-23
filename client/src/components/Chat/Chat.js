import React, { useState, useEffect } from "react";
import { For } from "react-loops";
import queryString from "query-string";
import io from "socket.io-client";

import axios from "axios";

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import UserInfoBar from "../UserInfoBar/UserInfoBar";
import Input from "../Input/Input";
import ChatRooms from "../ChatRoom/ChatRooms";
import ChatRoom from "../ChatRoom/ChatRoom";
import Modal from "../Modal/Modal";
import ModalParticipate from "../ModalParticipate/ModalParticipate";
import { useLocation } from 'react-router-dom';
import { Link } from "react-router-dom";

import plusIcon from "../../icons/plus.png";
import "./Chat.css";

// const ENDPOINT = 'https://project-chat-application.herokuapp.com/';
const ENDPOINT = "http://localhost:5000/";

let socket;

const Chat = ({ location, history, props }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [password, setPassword] = useState("");
  const [rooms, setRooms] = useState([]);
  const [isClicked, setIsClicked] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [plusRoomOpen, setPlusRoomOpen] = useState(false);
  const [plusRoomName, setPlusRoomName] = useState("");
  const [plusRoomPass, setPlusRoomPass] = useState("");
  const [plusRoomPassCheck, setPlusRoomPassCheck] = useState("");
  const [participateRoomOpen, setParticipateRoomOpen] = useState(false);
  const [participateRoomName, setParticipateRoomName] = useState("");
  const [participateRoomPass, setParticipateRoomPass] = useState("");
  const [roomId, setRoomId] = useState(0);
  const [userId, setUserId] = useState(0);
  const [show, setShow] = useState(false);
  const [roomClicked, setRoomClicked] = useState(false);

  const { state } = useLocation();
  useEffect(() => {
    // const { name, password } = queryString.parse(location.search);

    socket = io.connect(ENDPOINT);
    console.log(state.name);
    console.log(state.password);

    // setRoom(room);
    // setRoom("임시 방이름");
    setName(state.name);
    setPassword(state.password);

  }, [ENDPOINT, location.search]);


  useEffect(() => {
    if (name != "" && password != "") {

      console.log(name);
      console.log(password);
      // axios post
      axios
        .post("http://localhost:5000/signIn", {
          loginId: name,
          password: password
        })
        .then(function (response) {
          console.log(response);
          console.log(response.data.response);

          if (response.data.userId !== undefined) {
            console.log("userId" + response.data.userId);
            setUserId(response.data.userId);

            getRoomsOfUser(response.data.userId);
          } else {
            history.push("/");
            alert("아이디 혹은 비밀번호가 일치하지 않습니다.");
          }
        })
        .catch(function (error) {
          alert("에러 발생");
          console.log(error);
        });
    }
  }, [name, password]);

  useEffect(() => {
    // admin의 메세지를 받아서 뿌리기
    socket.on("message", (message) => {
      console.log("message : " + message);
      setMessages((messages) => [...messages, message]);
    });

    // 참가자 갱신
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    const fetchRooms = async () => {
      console.log("fetchRooms!");
      setIsError(false);
      setIsLoading(true);
      try {
        const roomsData = rooms;

        setRooms(roomsData);
        console.log(rooms);
      } catch (error) {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchRooms();
  }, []);

  // 버튼 클릭 후 룸 목록을 띄운다.
  const _onButtonClick = () => {
    setIsClicked(true);
    console.log("clicked! Rooms length : " + rooms.length);
  };

  // 해당 유저의 룸 목록을 가져옴
  const getRoomsOfUser = (message) => {
    console.log("Get rooms");
    // axios post
    // @문제 : setUserId()가 안먹힌다.
    axios
      .post("http://localhost:5000/getRooms", {
        userId: message,
      })
      .then(function (response) {

        var results = response.data.rows;
        console.log(results);
        setRooms(response.data.rows);

      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });
  };

  const sendMessage = (event) => {
    event.preventDefault();
    socket.emit("sendMessage", { message, name, room }, () => setMessage(""));

    if (message) {
      axios
        .post("http://localhost:5000/chatAdd", {
          room: room,
          userId: userId,
          message: message,
        })
        .then(function (response) {
          console.log(response);
          console.log(response.data.response);

          if (response.data.response == "true") {
            //alert("Success");
          } else {
            alert("Fail");
          }
        })
        .catch(function (error) {
          alert("에러 발생");
          console.log(error);
        });
    }

  };

  // room 추가
  const openPlusRoom = () => {
    console.log("Plus room");

    setPlusRoomOpen(true);
  };

  const closePlusRoom = () => {
    setPlusRoomOpen(false);
  };

  const addPlusRoom = () => {
    console.log("ADD");
    if (plusRoomName == "" || plusRoomPass == "" || plusRoomPassCheck == "") {
      alert("Please fill all of the options.");
      return;
    }

    if (plusRoomPass != plusRoomPassCheck) {
      alert("Incorrect Password.");
      return;
    }

    // axios post
    axios
      .post("http://localhost:5000/roomAdd", {
        plusRoomName: plusRoomName,
        plusRoomPassword: plusRoomPass,
        userId: userId,
      })
      .then(function (response) {
        console.log(response);
        console.log(response.data.response);

        if (response.data.response == "true") {
          alert("The Room Added");
          closePlusRoom();
        } else {
          alert("The room is already exist.");
        }
      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });
  };

  // const getChatsInRoom = (roomName) => {
  //   console.log(roomName);
  //   setRoom(roomName);
  //   setMessages([]);

  //   requestChats(roomName);

  //   // socket.emit("roomJoin", { name, roomName }, (error) => {
  //   //   if (error) {
  //   //     alert(error);
  //   //   }
  //   // });
  // };

  // const requestChats = (roomName) => {
  //   console.log("requestChats");
  //   // return new Promise((resolve, reject) => {
  //   axios
  //     .post("http://localhost:5000/getChatsInRoom", {
  //       roomName: roomName,
  //       name: name,
  //       socketId: socket.id,
  //     })
  //     .then(function (response) {
  //       var items = response.data.rows;
  //       if (items != null) {
  //         setMessages(items);
  //       }
  //     })
  //     .catch(function (error) {
  //       alert("에러 발생");
  //       console.log(error);
  //     });
  //   // });
  // };

  // room 참가
  const openParticipateRoom = () => {
    console.log("Participate room");

    setParticipateRoomOpen(true);
  };

  const closeParticipateRoom = () => {
    setParticipateRoomOpen(false);
  };

  const participateRoom = () => {
    console.log("Participate");
    if (participateRoomName == "" || participateRoomPass == "") {
      alert("Please fill all of the options.");
      return;
    }

    // axios post
    axios
      .post("http://localhost:5000/roomParticipate", {
        participateRoomName: participateRoomName,
        participateRoomPass: participateRoomPass,
        userId: userId,
      })
      .then(function (response) {
        console.log(response);
        console.log(response.data.response);

        if (response.data.response == "true") {
          alert("The Room Participated.");
          closeParticipateRoom();
          // } else if (response.data.response == "false") {
          //   alert("Participation Fail.");
        } else {
          alert("Fail.");
        }
      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });
  };

  return (
    <div className="outerContainer">
      <div className="roomContainer">
        <UserInfoBar name={name} />
        <div className="plusDiv">
          <a className="myRoomText">My Rooms</a>
          <button id="plus" onClick={openPlusRoom}>
            +
          </button>
          <button id="participation" onClick={openParticipateRoom}>
            참가
          </button>
        </div>
        <div className="chatrooms">
          {/* <button onClick={_onButtonClick}>룸 목록</button> */}

          {/* {isClicked ?
            rooms.map(item =>
              <li key={item.name} onClick={() => getChatsInRoom(item.name)}><ChatRoom room={item.name} /></li>)
            : null
          } */}

          <ChatRooms
            rooms={rooms}
            name={name}
            socket={socket}
            setRoom={setRoom}
            setMessages={setMessages}
          />
        </div>
      </div>
      <div className="container">
        <InfoBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
      {/* <TextContainer users={users} /> */}

      {/* room 추가 */}
      <div className="ModalDiv">
        <Modal
          open={plusRoomOpen}
          close={closePlusRoom}
          header="Add Room"
          add={addPlusRoom}
        >
          <div>
            <input
              placeholder="Room Name"
              className="roomInput"
              type="text"
              onChange={(event) => setPlusRoomName(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Room password"
              className="roomInput mt-20"
              type="password"
              onChange={(event) => setPlusRoomPass(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Room password Check"
              className="roomInput mt-20"
              type="password"
              onChange={(event) => setPlusRoomPassCheck(event.target.value)}
            />
          </div>
        </Modal>
      </div>

      {/* room 참가 */}
      <div className="ModalDiv">
        <ModalParticipate
          open={participateRoomOpen}
          close={closeParticipateRoom}
          header="Participate Room"
          participate={participateRoom}
        >
          <div>
            <input
              placeholder="Room Name"
              className="roomInput"
              type="text"
              onChange={(event) => setParticipateRoomName(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Room password"
              className="roomInput mt-20"
              type="password"
              onChange={(event) => setParticipateRoomPass(event.target.value)}
            />
          </div>
        </ModalParticipate>
      </div>
    </div>
  );
};

export default Chat;
