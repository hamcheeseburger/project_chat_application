import React from "react";

import onlineIcon from "../../icons/onlineIcon.png";
import closeIcon from "../../icons/closeIcon.png";

import "./UserInfoBar.css";

const UserInfoBar = ({ name }) => (
  <div className="userInfoBar">
    <div className="leftInnerContainer">
      {/* <img className="onlineIcon" src={onlineIcon} alt="online icon" /> */}
      <h3>{name}님 환영합니다.</h3>
    </div>
    {/* <div className="rightInnerContainer">
      <a href="/">
        <img src={closeIcon} alt="close icon" />
      </a>
    </div> */}
  </div>
);

export default UserInfoBar;
