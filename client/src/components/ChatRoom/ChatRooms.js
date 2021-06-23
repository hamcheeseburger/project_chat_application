import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';
import ChatRoom from './ChatRoom';

const ChatRooms = ({ rooms, name, socket, setRoom, setMessages }) => (
    <ScrollToBottom className="rooms">
        {rooms.map((room) => <div key={room.name}><ChatRoom room={room.name} name={name} socket={socket} setRoom={setRoom} setMessages={setMessages} /></div>)}
        {/* {rooms.map((room) => <div key={room.name}>{room.name}</div>)} */}
    </ScrollToBottom>
);

export default ChatRooms;