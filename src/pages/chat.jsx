
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';
import { ArrowLeft, Send } from '../assets/icons.jsx';
import MessageItem from '../ui/message.jsx';

export default function ChatPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [friend, setFriend] = useState(null);
  const [messages, setMessages] = useState();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!profile ||!userId) return;
    const fetchFriendAndMessages = async () => {
      try {
        const { data: fProfile, error: fError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

        if (fError) throw fError;
        setFriend(fProfile);

        const { data: msgs, error: mError } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true });

        if (mError) throw mError;
        setMessages(msgs ||);
      } catch (err) {
        console.error('Error in chat loading', err);
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendAndMessages();
  }, [userId, profile, navigate]);

  useEffect(() => {
    if (!profile ||!userId) return;
    const channel = supabase
    .channel(`private_chat:${profile.id}:${userId}`)
    .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${userId}`
        },
        (payload) => {
          if (payload.new.receiver_id === profile.id) {
            setMessages(prev => [...prev, payload.new]);
          }
        }
      )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, profile]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const body = {
      sender_id: profile.id,
      receiver_id: userId,
      content: inputText.trim()
    };

    try {
      const { data, error } = await supabase
      .from('messages')
      .insert(body)
      .select()
      .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
      setInputText('');
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="chat-screen">
      <header className="chat-header">
        <button className="icon-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className="chat-header-info">
          <img src={friend?.avatar_url} className="chat-header-avatar" alt="avatar" />
          <span className="chat-header-username">{friend?.username}</span>
        </div>
        <div style={{ width: '40px' }}></div>
      </header>

      <main className="chat-messages-container">
        {messages.length === 0? (
          <div className="chat-empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map(msg => (
              <MessageItem key={msg.id} message={msg} currentUserId={profile.id} friend={friend} />
            ))}
            <div ref={scrollRef}></div>
          </div>
        )}
      </main>

      <footer className="chat-footer">
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-text-input"
            placeholder="Send a text..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="chat-send-btn">
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
}
