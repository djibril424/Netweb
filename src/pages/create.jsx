
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';

export default function CreatePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.length > 140) return;

    try {
      setSubmitting(true);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
      .from('posts')
      .insert({
          author_id: profile.id,
          content: content.trim(),
          expires_at: expiresAt
        });

      if (error) throw error;
      navigate('/feed');
    } catch (err) {
      alert('Could not submit post: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-screen">
      <header className="create-header">
        <button className="create-cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button
          className="create-submit-btn"
          onClick={handlePostSubmit}
          disabled={submitting ||!content.trim() || content.length > 140}
        >
          {submitting? 'Sharing...' : 'Button Post'}
        </button>
      </header>

      <main className="create-input-area">
        <textarea
          autoFocus
          className="create-textarea"
          placeholder="What's on your mind? (Max 140 characters)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="char-count-pill">
          {content.length} / 140
        </div>
      </main>
    </div>
  );
}
