import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

// import './Join.css';

export default function SignUp({ history }) {
    const [signId, setSignId] = useState('');
    const [signName, setSignName] = useState('');
    const [signPassword, setSignPassword] = useState('');

    const onSubmit = e => {
        console.log("submit");

        axios.post('http://localhost:5000/signUp', {
            'loginId': signId,
            'password': signPassword,
            'name': signName
        })
            .then(function (response) {
                console.log(response);

                alert("회원가입 완료");
                // root페이지로 이동
                history.push("/");
            })
            .catch(function (error) {
                alert("회원가입 실패");
                console.log(error);
            });
    };

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

                <button onClick={onSubmit} className={'button mt-20'} type="submit">Sign Up</button>
            </div>
        </div>
    );
}