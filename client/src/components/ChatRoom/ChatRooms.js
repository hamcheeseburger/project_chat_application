import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';
import ChatRoom from './ChatRoom';
import "./ChatRooms.css";

const ChatRooms = ({ userId, rooms, name, socket, setRoom, setMessages, getRoomsOfUser }) => (
    <ScrollToBottom className="rooms">
        {rooms.map((room) => <div key={room.name}><ChatRoom userId={userId} room={room.name} name={name} socket={socket} setRoom={setRoom} setMessages={setMessages} getRoomsOfUser={getRoomsOfUser} /></div>)}
        {/* {rooms.map((room) => <div key={room.name}>{room.name}</div>)} */}
    </ScrollToBottom>
);

export default ChatRooms;