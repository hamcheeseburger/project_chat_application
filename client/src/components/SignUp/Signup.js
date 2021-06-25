import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

// import './Join.css';

export default function SignUp({ history }) {
    const [signId, setSignId] = useState('');
    const [signName, setSignName] = useState('');
    const [signPassword, setSignPassword] = useState('');
    const [signPasswordCheck, setSignPasswordCheck] = useState('');

    const onSubmit = e => {
        console.log("submit");

        if (signPassword != signPasswordCheck) {
            alert('비밀번호가 일치하지 않습니다');
            return;
        }

        axios.post('http://localhost:5000/signUp', {
            'loginId': signId,
            'password': signPassword,
            'name': signName
        })
            .then(function (response) {
                console.log(response);
                console.log(response.data.response);

                if (response.data.response == 'true') {
                    alert("회원가입 완료");
                    // root페이지로 이동
                    history.push("/");
                } else {
                    alert("회원가입 실패 (db에 login_id가 이미 존재하는 경우)");
                }

            })
            .catch(function (error) {
                alert("에러 발생");
                console.log(error);
            });
    };

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">Sign Up</h1>
                <div>
                    <input placeholder="id" className="joinInput" type="text" onChange={(event) => setSignId(event.target.value)}/>
                </div>
                <div>
                    <input placeholder="password" className="joinInput mt-20" type="password" onChange={(event) => setSignPassword(event.target.value)}/>
                </div>
                <div>
                    <input placeholder="password check" className="joinInput mt-20" type="password" onChange={(event) => setSignPasswordCheck(event.target.value)} />
                </div>
                <div>
                    <input placeholder="name" className="joinInput mt-20" type="text" onChange={(event) => setSignName(event.target.value)} />
                </div>

                <button onClick={onSubmit} className={'button mt-20'} type="submit">Sign Up</button>
                <Link to={`/`}>
                    <button className={'button mt-20'} type="submit">HOME</button>
                    
                </Link>
            </div>
        </div>
    );
}