
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';
import SearchBar from '../ui/search.jsx';
import PostCard from '../ui/post.jsx';
import BottomNav from '../ui/nav.jsx';

export default function FeedPage() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState();
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data: friendships, error: fError } = await supabase
      .from('friendships')
      .select('user_one_id, user_two_id')
      .or(`user_one_id.eq.${profile.id},user_two_id.eq.${profile.id}`);

      if (fError) throw fError;

      const friendIds = friendships.map(f => 
        f.user_one_id === profile.id? f.user_two_id : f.user_one_id
      );

      const targetUserIds = [...friendIds, profile.id];
      const now = new Date().toISOString();

      const { data: activePosts, error: pError } = await supabase
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
      .in('author_id', targetUserIds)
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

      if (pError) throw pError;
      setPosts(activePosts ||);
    } catch (err) {
      console.error('Error fetching feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [profile]);

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

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/logo.png" className="header-logo" alt="logo" />
        <SearchBar />
      </header>

      <main className="main-content">
        {loading? (
          <div className="loader-container"><div className="loader"></div></div>
        ) : posts.length === 0? (
          <div className="empty-state">
            <p>No post to see</p>
            <p className="empty-state-hint">make a post or search a friend &gt;&gt;&gt;</p>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={profile.id}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
