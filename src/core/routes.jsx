
import React, { useState } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../app.jsx';
import { loginWithGoogle } from './auth.js';

import FeedPage from '../pages/feed.jsx';
import ChatPage from '../pages/chat.jsx';
import InboxPage from '../pages/inbox.jsx';
import FriendsPage from '../pages/friends.jsx';
import ProfilePage from '../pages/profile.jsx';
import CreatePage from '../pages/create.jsx';
import SettingsPage from '../pages/settings.jsx';

const RouteGuard = ({ children, requireProfile = true }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfile &&!profile) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

const AuthGuard = ({ children }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (session) {
    if (!profile) {
      return <Navigate to="/welcome" replace />;
    }
    return <Navigate to="/feed" replace />;
  }

  return children;
};

const WelcomeRoute = () => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (profile) {
    return <Navigate to="/feed" replace />;
  }

  return <ProfilePage welcomeMode={true} />;
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      alert('Login failed: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <img src="/logo.png" className="login-logo" alt="NETWEB Logo" />
        <h1 className="login-title">NETWEB</h1>
        <p className="login-subtitle">A Minimalistic Private Social Network</p>
        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading? 'Connecting...' : 'Connect with Google'}
        </button>
      </div>
    </div>
  );
};

export const router = createHashRouter([
  {
    path: '/',
    element: <AuthGuard><FeedPage /></AuthGuard>
  }
]);
