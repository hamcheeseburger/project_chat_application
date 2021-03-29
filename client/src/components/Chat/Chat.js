import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import axios from 'axios';

import TextContainer from "../TextContainer/TextContainer";
import Messages from "../Messages/Messages";
import InfoBar from "../InfoBar/InfoBar";
import UserInfoBar from "../UserInfoBar/UserInfoBar";
import Input from "../Input/Input";
import ChatRoom from "../ChatRoom/ChatRoom";
import Modal from "../Modal/Modal";

import { Link } from "react-router-dom";


import plusIcon from "../../icons/plus.png";
import "./Chat.css";

// const ENDPOINT = 'https://project-chat-application.herokuapp.com/';
const ENDPOINT = "http://localhost:5000/";

let socket;

const Chat = ({ location, history }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [users, setUsers] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [plusRoomOpen, setPlusRoomOpen] = useState(false);
  const [plusRoomName, setPlusRoomName] = useState("");
  const [plusRoomPass, setPlusRoomPass] = useState("");
  const [plusRoomPassCheck, setPlusRoomPassCheck] = useState("");
  const [userId, setUserId] = useState(-1);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    // setRoom(room);
    setRoom("임시 방이름");
    setName(name);

    socket.emit("join", { name, room }, (error) => {
      if (error) {
        alert(error);
      }
    });
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    // 참가자 갱신
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on("login", (message) => {
      console.log(message);
      if (message == -1) {

        history.push("/");
        return;
      }

      // 로그인 성공시, message로 userId 넘겨줌
      setUserId(message);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

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
    axios.post('http://localhost:5000/roomAdd', {
      "plusRoomName": plusRoomName,
      "plusRoomPassword": plusRoomPass,
      "userId": userId
    })
      .then(function (response) {
        console.log(response);
        console.log(response.data.response);

        if (response.data.response == 'true') {
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

  return (
    <div className="outerContainer">
      <div className="roomContainer">
        <UserInfoBar name={name} />
        <div className="plusDiv">
          <button id="plus" onClick={openPlusRoom}>+</button>
        </div>
        <ChatRoom room={room} />
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

      <div className="ModalDiv">
        <Modal open={plusRoomOpen} close={closePlusRoom} header="Add Room" add={addPlusRoom}>
          <div>
            <input placeholder="Room Name" className="roomInput" type="text" onChange={(event) => setPlusRoomName(event.target.value)} />
          </div>
          <div>
            <input placeholder="Room password" className="roomInput mt-20" type="password" onChange={(event) => setPlusRoomPass(event.target.value)} />
          </div>
          <div>
            <input placeholder="Room password Check" className="roomInput mt-20" type="password" onChange={(event) => setPlusRoomPassCheck(event.target.value)} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Chat;
