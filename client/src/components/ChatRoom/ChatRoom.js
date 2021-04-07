import React from "react";
import axios from "axios";

import onlineIcon from "../../icons/onlineIcon.png";
import closeIcon from "../../icons/closeIcon.png";

import "./ChatRoom.css";

const ChatRoom = ({ room, setRoom, setMessages }) => {
  const roomClicked = () => {
    setRoom(room);
    setMessages([]);

    requestChats(room);
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
        <a href="/">
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
