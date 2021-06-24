import React, { useEffect } from "react";
import axios from "axios";

import onlineIcon from "../../icons/onlineIcon.png";
import closeIcon from "../../icons/closeIcon.png";

import "./ChatRoom.css";
import io from "socket.io-client";

let socket;
const ENDPOINT = "http://localhost:5000/";
const ChatRoom = ({ userId, room, name, socket, setRoom, setMessages, getRoomsOfUser }) => {

  const exitRoom = () => {
    console.log("exitRoom : " + room);
    console.log("userId : " + userId);
    if (room == "") return;

    var result = window.confirm("방에서 퇴장하시겠습니까?");

    if (result == false) return;

    axios
      .post("http://localhost:5000/exitRoom", {
        userId: userId,
        room: room
      })
      .then(function (response) {
        console.log("삭제 : " + response);
        console.log("삭제response : " + response.data.response);
        getRoomsOfUser(userId);

      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });

    socket.emit("exit", { room, name }, () => {

    });
  };

  const roomClicked = () => {
    setRoom(room);
    setMessages([]);

    requestChats(room);
    console.log("roomclicked : " + room);
    socket.emit("roomJoin", { name, room }, (errormessage) => {
      console.log(errormessage);
    });
  };

  const requestChats = (roomName) => {
    console.log("requestChats");
    // return new Promise((resolve, reject) => {
    axios
      .post("http://localhost:5000/getChatsInRoom", {
        roomName: roomName
        // name: name,
        // socketId: socket.id
      })
      .then(function (response) {
        var items = response.data.rows;
        if (items != null) {
          setMessages(items);
        }

      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });
    // });
  };

  return (
    <div onClick={roomClicked} className="chatRoom">
      <div className="chatRoomContainer">
        <img className="onlineIcon" src={onlineIcon} alt="online icon" />
        <h3>{room}</h3>
      </div>
      <div className="rightInnerContainer">
        <a href="#" onClick={exitRoom}>
          <img src={closeIcon} alt="close icon" />
        </a>
      </div>
    </div>
  );
};

// const ChatRoom = ({ rooms }) => {
//   // console.log(rooms[1]);
//   return rooms.map(room => (
//     <div className="chatRoom">
//       <div className="chatRoomContainer">
//         <img className="onlineIcon" src={onlineIcon} alt="online icon" />
//         <h3>{room.name}</h3>
//       </div>
//       <div className="rightInnerContainer">
//         <a href="/">
//           <img src={closeIcon} alt="close icon" />
//         </a>
//       </div>
//     </div>
//   ));
// }



export default ChatRoom;
