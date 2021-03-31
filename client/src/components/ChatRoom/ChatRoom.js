import React from "react";

import onlineIcon from "../../icons/onlineIcon.png";
import closeIcon from "../../icons/closeIcon.png";

import "./ChatRoom.css";

const ChatRoom = ({ room }) => (
  <div className="chatRoom">
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

// const ChatRoom = ({ rooms }) => {
//   // console.log(rooms[1]);
//   return rooms.map(room => (
//     <div className="chatRoom">
//     <div className="chatRoomContainer">
//       <img className="onlineIcon" src={onlineIcon} alt="online icon" />
//       <h3>{room.name}</h3>
//     </div>
//     <div className="rightInnerContainer">
//       <a href="/">
//         <img src={closeIcon} alt="close icon" />
//       </a>
//     </div>
//   </div>
//   ));
// }

 

export default ChatRoom;
