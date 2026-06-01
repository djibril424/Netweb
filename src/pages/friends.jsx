
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';
import SearchBar from '../ui/search.jsx';
import RequestItem from '../ui/request.jsx';
import BottomNav from '../ui/nav.jsx';

export default function FriendsPage() {
  const { profile } = useAuth();
  const = useState();
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
      .from('friend_requests')
      .select(`
          id,
          sender_id,
          profiles!friend_requests_sender_id_fkey (
            id,
            username,
            handle,
            avatar_url,
            bio
          )
        `)
      .eq('receiver_id', profile.id)
      .eq('status', 'pending');

      if (error) throw error;
      setRequests(data ||);
    } catch (err) {
      console.error('Error fetching requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [profile]);

  const handleAccept = async (req) => {
    try {
      const { error: updateReqError } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', req.id);

      if (updateReqError) throw updateReqError;

      const [u1, u2] = profile.id < req.sender_id 
      ? [profile.id, req.sender_id] 
        : [req.sender_id, profile.id];

      const { error: insertFriendshipError } = await supabase
      .from('friendships')
      .insert({ user_one_id: u1, user_two_id: u2 });

      if (insertFriendshipError) throw insertFriendshipError;

      setRequests(prev => prev.filter(r => r.id!== req.id));
    } catch (err) {
      alert('Accept failed: ' + err.message);
    }
  };

  const handleRefuse = async (reqId) => {
    try {
      const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'rejected' })
      .eq('id', reqId);

      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id!== reqId));
    } catch (err) {
      alert('Refuse failed: ' + err.message);
    }
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
        ) : requests.length === 0? (
          <div className="empty-state">
            <p>No pending friend requests</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map(req => (
              <RequestItem
                key={req.id}
                request={req}
                onAccept={() => handleAccept(req)}
                onRefuse={() => handleRefuse(req.id)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
