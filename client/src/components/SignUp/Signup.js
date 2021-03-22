import React, { useState } from 'react';
import { Link } from "react-router-dom";

// import './Join.css';

export default function SignUp() {
    const [signId, setSignId] = useState('');
    const [signName, setSignName] = useState('');
    const [signPassword, setSignPassword] = useState('');

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">Sign Up</h1>
                <div>
                    <input placeholder="id" className="joinInput" type="text" onChange={(event) => setSignId(event.target.value)} />
                </div>
                <div>
                    <input placeholder="password" className="joinInput mt-20" type="password" onChange={(event) => setSignPassword(event.target.value)} />
                </div>
                <div>
                    <input placeholder="name" className="joinInput mt-20" type="text" onChange={(event) => setSignName(event.target.value)} />
                </div>
                <Link onClick={e => (!signId || !signName || !signPassword) ? e.preventDefault() : null} to={`/?signId=${signId}&signName=${signName}&signPassword=${signPassword}`}>
                    <button className={'button mt-20'} type="submit">Sign Up</button>
                </Link>
            </div>
        </div>
    );
}