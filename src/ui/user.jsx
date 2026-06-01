
import React from 'react';

export default function UserPreview({ user, subtitle, onClick }) {
  return (
    <div className="user-preview-card" onClick={onClick}>
      <img src={user.avatar_url} className="user-preview-avatar" alt="avatar" />
      <div className="user-preview-details">
        <span className="user-preview-username">{user.username} <span style={{color: '#888', fontWeight: 400, fontSize: '12px'}}>@{user.handle}</span></span>
        {subtitle && <p className="user-preview-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
