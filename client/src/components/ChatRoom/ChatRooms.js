import React from 'react';

import ScrollToBottom from 'react-scroll-to-bottom';
import ChatRoom from './ChatRoom';

const ChatRooms = ({ rooms, userId, socket, setRoom, setMessages }) => (
    <ScrollToBottom className="rooms">
        {rooms.map((room) => <div key={room.name}><ChatRoom room={room.name} userId={userId} socekt={socket} setRoom={setRoom} setMessages={setMessages} /></div>)}
        {/* {rooms.map((room) => <div key={room.name}>{room.name}</div>)} */}
    </ScrollToBottom>
);

export default ChatRooms;