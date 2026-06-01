
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';
import SearchBar from '../ui/search.jsx';
import UserPreview from '../ui/user.jsx';
import BottomNav from '../ui/nav.jsx';

export default function InboxPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!profile) return;
      try {
        setLoading(true);
        const { data: userMessages, error: mError } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, content, created_at')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

        if (mError) throw mError;

        const uniquePartnerIds = new Set();
        const partnerLastMessages = {};

        userMessages.forEach(msg => {
          const partnerId = msg.sender_id === profile.id? msg.receiver_id : msg.sender_id;
          if (!uniquePartnerIds.has(partnerId)) {
            uniquePartnerIds.add(partnerId);
            partnerLastMessages[partnerId] = msg;
          }
        });

        const partnerIds = Array.from(uniquePartnerIds);

        if (partnerIds.length === 0) {
          setConversations();
          return;
        }

        const { data: partners, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', partnerIds);

        if (pError) throw pError;

        const convs = partners.map(p => ({
          partner: p,
          lastMessage: partnerLastMessages[p.id]
        })).sort((a, b) => 
          new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
        );

        setConversations(convs);
      } catch (err) {
        console.error('Error fetching conversations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [profile]);

  const handlePartnerClick = (partnerId) => {
    navigate(`/chat/${partnerId}`);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/logo.png" className="header-logo" alt="logo" />
        <SearchBar />
      </header>

      <main className="main-content">
        {loading? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : conversations.length === 0? (
          <div className="empty-state">
            <p>You&apos;ve No friends search</p>
            <p className="empty-state-hint">a friend and message them &gt;&gt;</p>
          </div>
        ) : (
          <div className="conversations-list">
            {conversations.map(({ partner, lastMessage }) => (
              <UserPreview
                key={partner.id}
                user={partner}
                subtitle={lastMessage.content}
                onClick={() => handlePartnerClick(partner.id)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
