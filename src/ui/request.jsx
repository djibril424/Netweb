
import React from 'react';
import { Link } from 'react-router-dom';

export default function RequestItem({ request, onAccept, onRefuse }) {
  const sender = request.profiles;

  return (
    <div className="request-card">
      <Link to={`/profile/${sender.id}`} className="request-user-info">
        <img src={sender.avatar_url} className="request-avatar" alt="avatar" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="request-username">{sender.username}</span>
          <span style={{ fontSize: '11px', color: '#888' }}>@{sender.handle}</span>
        </div>
      </Link>
      <div className="request-action-buttons">
        <button className="request-accept-btn" onClick={onAccept}>Accept</button>
        <button className="request-refuse-btn" onClick={onRefuse}>Refuse</button>
      </div>
    </div>
  );
}
