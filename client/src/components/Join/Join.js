import React, { useState } from 'react';
import { Link } from "react-router-dom";

import './Join.css';

export default function SignIn() {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Join</h1>
        <div>
          <input placeholder="Id" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} />
        </div>
        <div>
          <input placeholder="Password" className="joinInput mt-20" type="password" onChange={(event) => setRoom(event.target.value)} />
        </div>
        <Link onClick={e => (!name || !room) ? e.preventDefault() : null} to="/chat" method="post">
          <button className={'button mt-20'} type="submit">Sign In</button>
        </Link>
        {/* <Link to={`/signUp`}>
          <button className={'button mt-20'} type="submit">Sign Up</button>
        </Link> */}
        <Link to={'/signUp'}>
          <p>SIGN UP</p>
        </Link>
      </div>
    </div>
  );
}

//get -> post : Link 사용해서 변경하기