
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';
import { Settings, ArrowLeft } from '../assets/icons.jsx';
import PostCard from '../ui/post.jsx';
import BottomNav from '../ui/nav.jsx';
import { cleanHandle } from '../utils/format.js';

export default function ProfilePage({ welcomeMode = false }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { session, profile: myProfile, refreshProfile } = useAuth();

  const isSelf = welcomeMode ||!userId || userId === myProfile?.id;
  const targetId = isSelf? (welcomeMode? session?.user?.id : myProfile?.id) : userId;

  const [targetProfile, setTargetProfile] = useState(null);
  const [welcomeForm, setWelcomeForm] = useState({
  username:'',
  handle:'',
  bio:'',
  avatarUrl:''
});
  const [posts, setPosts] = useState();
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [friendCount, setFriendCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (welcomeMode) {
      setLoading(false);
      return;
    }
    if (!targetId) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);

        const { data: prof, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .maybeSingle();

        if (pError) throw pError;
        if (!prof) {
          if (isSelf) {
            navigate('/welcome');
          } else {
            alert('Profile not found.');
            navigate('/feed');
          }
          return;
        }

        setTargetProfile(prof);

        if (isSelf) {
          const { data: friends, error: fError } = await supabase
          .from('friendships')
          .select('id')
          .or(`user_one_id.eq.${targetId},user_two_id.eq.${targetId}`);

          if (fError) throw fError;
          setFriendCount(friends?.length || 0);

          const { data: sentRequests, error: rError } = await supabase
          .from('friend_requests')
          .select('id')
          .eq('sender_id', targetId)
          .eq('status', 'pending');

          if (rError) throw rError;
          setRequestCount(sentRequests?.length || 0);

          const now = new Date().toISOString();
          const { data: activePosts, error: postsError } = await supabase
          .from('posts')
          .select(`
              id,
              content,
              created_at,
              expires_at,
              author_id,
              profiles!posts_author_id_fkey (
                username,
                handle,
                avatar_url
              )
            `)
          .eq('author_id', targetId)
          .gt('expires_at', now)
          .order('created_at', { ascending: false });

          if (postsError) throw postsError;
          setPosts(activePosts ||);
        } else {
          const [u1, u2] = myProfile.id < targetId? [myProfile.id, targetId] : [targetId, myProfile.id];
          const { data: friends, error: fError } = await supabase
          .from('friendships')
          .select('id')
          .eq('user_one_id', u1)
          .eq('user_two_id', u2)
          .maybeSingle();

          if (fError && fError.code!== 'PGRST116') throw fError;

          if (friends) {
            setFriendshipStatus('friends');

            const now = new Date().toISOString();
            const { data: friendPosts, error: postsError } = await supabase
            .from('posts')
            .select(`
                id,
                content,
                created_at,
                expires_at,
                author_id,
                profiles!posts_author_id_fkey (
                  username,
                  handle,
                  avatar_url
                )
              `)
            .eq('author_id', targetId)
            .gt('expires_at', now)
            .order('created_at', { ascending: false });

            if (postsError) throw postsError;
            setPosts(friendPosts ||);
          } else {
            const { data: sentReq, error: srError } = await supabase
            .from('friend_requests')
            .select('*')
            .eq('sender_id', myProfile.id)
            .eq('receiver_id', targetId)
            .eq('status', 'pending')
            .maybeSingle();

            if (srError && srError.code!== 'PGRST116') throw srError;

            if (sentReq) {
              setFriendshipStatus('request_sent');
            } else {
              const { data: recvReq, error: rrError } = await supabase
              .from('friend_requests')
              .select('*')
              .eq('sender_id', targetId)
              .eq('receiver_id', myProfile.id)
              .eq('status', 'pending')
              .maybeSingle();

              if (rrError && rrError.code!== 'PGRST116') throw rrError;

              if (recvReq) {
                setFriendshipStatus('request_received');
              } else {
                setFriendshipStatus('none');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading profile screen', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  },);

  const handleWelcomeSubmit = async (e) => {
    e.preventDefault();
    const cleanedHandle = cleanHandle(welcomeForm.handle);

    if (!cleanedHandle ||!welcomeForm.username.trim() || welcomeForm.bio.length > 100 ||!welcomeForm.avatarUrl) {
      alert('Ensure all fields are valid and bio is under 100 chars');
      return;
    }

    try {
      setSubmitting(true);

      const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('handle')
      .eq('handle', cleanedHandle)
      .maybeSingle();

      if (checkError && checkError.code!== 'PGRST116') throw checkError;
      if (existing) {
        alert('Handle is already taken');
        setSubmitting(false);
        return;
      }

      const body = {
        id: session.user.id,
        username: welcomeForm.username.trim(),
        handle: cleanedHandle,
        avatar_url: welcomeForm.avatarUrl,
        bio: welcomeForm.bio
      };

      const { error: insError } = await supabase
      .from('profiles')
      .insert(body);

      if (insError) throw insError;

      await refreshProfile();
      navigate('/feed');
    } catch (err) {
      alert('Could not set up profile: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      const { error } = await supabase
      .from('friend_requests')
      .insert({
          sender_id: myProfile.id,
          receiver_id: targetId,
          status: 'pending'
        });

      if (error) throw error;
      setFriendshipStatus('request_sent');
    } catch (err) {
      alert('Could not send friend request: ' + err.message);
    }
  };

  const handleCancelFriendship = async () => {
    if (!window.confirm('Remove friend connection?')) return;
    try {
      const [u1, u2] = myProfile.id < targetId? [myProfile.id, targetId] : [targetId, myProfile.id];
      const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('user_one_id', u1)
      .eq('user_two_id', u2);

      if (error) throw error;
      setFriendshipStatus('none');
      setPosts();
    } catch (err) {
      alert('Could not cancel friendship: ' + err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id!== postId));
    } catch (err) {
      alert('Could not delete post: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (welcomeMode) {
    return (
      <div className="welcome-screen">
        <form className="welcome-form" onSubmit={handleWelcomeSubmit}>
          <h2 className="welcome-title">Set up Profile</h2>
          
          <label className="form-label">Profile Picture URL</label>
          <input
            type="url"
            required
            className="form-input"
            placeholder="https://example.com/avatar.jpg"
            value={welcomeForm.avatarUrl}
            onChange={(e) => setWelcomeForm({...welcomeForm, avatarUrl: e.target.value })}
          />

          <label className="form-label">Display Name</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="Jane Doe"
            value={welcomeForm.username}
            onChange={(e) => setWelcomeForm({...welcomeForm, username: e.target.value })}
          />

          <label className="form-label">Handle</label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="@janedoe"
            value={welcomeForm.handle}
            onChange={(e) => setWelcomeForm({...welcomeForm, handle: e.target.value })}
          />

          <label className="form-label">Short Bio (Max 100 Characters)</label>
          <textarea
            required
            maxLength={100}
            className="form-textarea"
            placeholder="Tell us about yourself..."
            value={welcomeForm.bio}
            onChange={(e) => setWelcomeForm({...welcomeForm, bio: e.target.value })}
          />

          <button type="submit" disabled={submitting} className="welcome-submit-btn">
            {submitting? 'Setting up...' : 'Next Page'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="profile-header">
        {!isSelf? (
          <button className="icon-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div style={{ width: '40px' }}></div>
        )}
        <span className="profile-header-title">{targetProfile?.username}</span>
        {isSelf? (
          <button className="icon-button" onClick={() => navigate('/settings')}>
            <Settings size={24} />
          </button>
        ) : (
          <div style={{ width: '40px' }}></div>
        )}
      </header>

      <main className="main-content">
        <div className="profile-info-block">
          <img src={targetProfile?.avatar_url} className="profile-avatar-large" alt="avatar" />
          <h2 className="profile-username-heading">{targetProfile?.username}</h2>
          <p style={{ color: '#888', marginBottom: '12px', fontWeight: 600 }}>@{targetProfile?.handle}</p>

          {isSelf && (
            <div className="profile-stats-row">
              <span className="stat-pill">Friend N°: {friendCount}</span>
              <span className="stat-pill">Request N°: {requestCount}</span>
            </div>
          )}

          <p className="profile-bio-text">{targetProfile?.bio}</p>

          {!isSelf && (
            <div className="profile-relation-action">
              {friendshipStatus === 'none' && (
                <button className="action-button-solid" onClick={handleSendFriendRequest}>
                  Request friendship
                </button>
              )}
              {friendshipStatus === 'request_sent' && (
                <button className="action-button-muted" disabled>
                  Pending Request
                </button>
              )}
              {friendshipStatus === 'request_received' && (
                <button className="action-button-solid" onClick={() => navigate('/friends')}>
                  View Request
                </button>
              )}
              {friendshipStatus === 'friends' && (
                <button className="action-button-danger" onClick={handleCancelFriendship}>
                  Cancel friendship
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-posts-divider"></div>

        <div className="profile-posts-area">
          {(!isSelf && friendshipStatus!== 'friends')? (
            <div className="locked-profile-notice">
              <p className="locked-profile-label">&lt;&lt;&lt; You can&apos;t see posts</p>
              <p className="locked-profile-sublabel">unless you&apos;re friends</p>
            </div>
          ) : posts.length === 0? (
            <div className="empty-state">
              <p>You&apos;ve no post make</p>
              <p className="empty-state-hint">a post &gt;&gt;</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={myProfile.id}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
