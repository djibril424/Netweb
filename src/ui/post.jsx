
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from '../assets/icons.jsx';
import { formatCountdown } from '../utils/time.js';

export default function PostCard({ post, currentUserId, onDelete }) {
  const isOwner = post.author_id === currentUserId;
  const [countdown, setCountdown] = useState(formatCountdown(post.expires_at));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(post.expires_at));
    }, 60000);

    return () => clearInterval(timer);
  }, [post.expires_at]);

  return (
    <div className="post-card">
      <div className="post-header-row">
        <Link to={`/profile/${post.author_id}`} className="post-user-info">
          <img src={post.profiles?.avatar_url} className="post-avatar" alt="avatar" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="post-username">{post.profiles?.username}</span>
            <span style={{ fontSize: '11px', color: '#888' }}>@{post.profiles?.handle}</span>
          </div>
        </Link>
        <span className="post-timer">{countdown}</span>
      </div>

      <p className="post-body-text">{post.content}</p>

      <div className="post-footer-actions">
        {isOwner && (
          <button className="post-delete-btn" onClick={() => onDelete(post.id)}>
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
