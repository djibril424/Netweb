
import React from 'react';

export default function MessageItem({ message, currentUserId, friend }) {
  const isSelf = message.sender_id === currentUserId;
  const senderName = isSelf? 'me' : friend?.username;

  return (
    <div className={`message-item ${isSelf? 'self-align' : 'friend-align'}`}>
      <span className="message-item-sender">{senderName}</span>
      <p className="message-item-text">{message.content}</p>
    </div>
  );
}
