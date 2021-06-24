import React from 'react';

import onlineIcon from '../../icons/onlineIcon.png';
import closeIcon from '../../icons/closeIcon.png';

import axios from "axios";
import './InfoBar.css';

const InfoBar = (props) => {

  const exitRoom = () => {
    var room = props.room;
    var name = props.name;
    var userId = props.userId;
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
        props.getRoomsOfUser(userId);

      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });

    props.socket.emit("exit", { room, name }, () => {

    });
  };

  return (<div className="infoBar">
    <div className="leftInnerContainer">
      <img className="onlineIcon" src={onlineIcon} alt="online icon" />
      <h3>{props.room}</h3>
    </div>
    <div className="rightInnerContainer">
      <a onClick={() => exitRoom()} href="#">
        <img src={closeIcon} alt="close icon" />
      </a>
    </div>
  </div>
  );
};

export default InfoBar;