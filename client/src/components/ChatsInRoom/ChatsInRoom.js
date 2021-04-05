import React, { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';


export default function ChatsInRoom({ history }) {
    const [signId, setSignId] = useState('');
    const [signName, setSignName] = useState('');
    const [signPassword, setSignPassword] = useState('');
    const [signPasswordCheck, setSignPasswordCheck] = useState('');


    return (
        <div className="joinOuterContainer">

        </div>
    );
}