import React, { useState, useEffect } from "react";

import onlineIcon from "../../icons/onlineIcon.png";
import closeIcon from "../../icons/closeIcon.png";
import editIcon from "../../icons/editIcon.png";

import ModalEdit from "../ModalEdit/ModalEdit";
import axios from "axios";
import "./InfoBar.css";

// const ENDPOINT = "http://localhost:5000/";
const ENDPOINT = 'https://our-chat-server.herokuapp.com/';
const InfoBar = (props) => {
  const [editRoomNameOpen, setEditRoomNameOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomPass, setRoomPass] = useState("");
  const [roomPassCheck, setRoomPassCheck] = useState("");

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
      .post(ENDPOINT + "exitRoom", {
        userId: userId,
        room: room,
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

    props.socket.emit("exit", { room, name }, () => { });
  };

  const openEditRoomName = () => {
    console.log("Edit room");

    setEditRoomNameOpen(true);
  };

  const editRoomNameClose = () => {
    setEditRoomNameOpen(false);
  };

  const editRoomName = () => {
    var room = props.room;
    console.log("EDIT");
    if (roomName == "") {
      alert("Please fill all of the options.");
      return;
    }
    if (roomName == "" || roomPass == "" || roomPassCheck == "") {
      alert("Please fill all of the options.");
      return;
    }

    if (roomPass != roomPassCheck) {
      alert("Incorrect Password.");
      return;
    }

    // axios post
    axios
      .post(ENDPOINT + "roomEdit", {
        roomName: roomName,
        roomPass: roomPass,
        roomPassCheck: roomPassCheck,
        room: room,
      })
      .then(function (response) {
        console.log("수정 : " + response);
        console.log("수정response : " + response.data.response);

        if (response.data.response == "true") {
          alert("The Room Edited");
          editRoomNameClose();
          props.getRoomsOfUser(props.userId);
        } else {
          alert("The room is already exist.");
        }
      })
      .catch(function (error) {
        alert("에러 발생");
        console.log(error);
      });

    console.log("InfoBar의 roomName: " + roomName);
    props.socket.emit("edit", { roomName }, () => { });
  };

  return (
    <div className="infoBar">
      <div className="leftInnerContainer">
        <img className="onlineIcon" src={onlineIcon} alt="online icon" />
        <h3>{props.room}</h3>
        <button className="editIconBtn" id="edit" onClick={openEditRoomName}>
          <img className="editIcon" src={editIcon} alt="edit icon" />
        </button>
      </div>
      <div className="rightInnerContainer">
        <a onClick={() => exitRoom()} href="#">
          <img src={closeIcon} alt="close icon" />
        </a>
      </div>
      {/* room 추가 */}
      <div className="ModalDiv">
        <ModalEdit
          open={editRoomNameOpen}
          close={editRoomNameClose}
          header="Edit Room"
          edit={editRoomName}
        >
          <div>
            <input
              placeholder="Room Name"
              className="roomInput"
              type="text"
              onChange={(event) => setRoomName(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Room password"
              className="roomInput mt-20"
              type="password"
              onChange={(event) => setRoomPass(event.target.value)}
            />
          </div>
          <div>
            <input
              placeholder="Room password Check"
              className="roomInput mt-20"
              type="password"
              onChange={(event) => setRoomPassCheck(event.target.value)}
            />
          </div>
        </ModalEdit>
      </div>
    </div>
  );
};

export default InfoBar;
