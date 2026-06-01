
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app.jsx';
import { cleanHandle } from '../utils/format.js';

export default function SettingsPage() {
  const { profile, refreshProfile, setProfile } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username || '');
  const [handle, setHandle] = useState(profile?.handle || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const = useState(profile?.bio || '');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const cleanedHandle = cleanHandle(handle);

    if (!cleanedHandle ||!username.trim() || bio.length > 100 ||!avatarUrl) {
      alert('Invalid fields. Please review limits.');
      return;
    }

    try {
      setUpdating(true);

      if (cleanedHandle!== profile.handle) {
        const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('handle')
        .eq('handle', cleanedHandle)
        .maybeSingle();

        if (checkError && checkError.code!== 'PGRST116') throw checkError;
        if (existing) {
          alert('Handle taken.');
          setUpdating(false);
          return;
        }
      }

      const { error: profError } = await supabase
      .from('profiles')
      .update({
          username: username.trim(),
          handle: cleanedHandle,
          avatar_url: avatarUrl,
          bio: bio
        })
      .eq('id', profile.id);

      if (profError) throw profError;

      if (password.trim()) {
        const { error: passError } = await supabase.auth.updateUser({
          password: password
        });
        if (passError) throw passError;
      }

      await refreshProfile();
      navigate('/profile');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm('DANGER: This will permanently delete your account, posts, messages, and relationships. It cannot be undone. Proceed?');
    if (!confirmation) return;

    try {
      setUpdating(true);
      const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.id);

      if (deleteProfileError) throw deleteProfileError;

      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;

      setProfile(null);
      navigate('/login');
    } catch (err) {
      alert('Failed to delete account: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="settings-screen">
      <header className="settings-header">
        <button className="settings-cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
        <span className="settings-title">Settings</span>
        <button className="settings-save-btn" onClick={handleSave} disabled={updating}>
          {updating? 'Saving...' : 'Save'}
        </button>
      </header>

      <main className="settings-form-container">
        <form onSubmit={handleSave} className="settings-form">
          <label className="form-label">Profile Picture URL</label>
          <input
            type="url"
            required
            className="form-input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <label className="form-label">Display Name</label>
          <input
            type="text"
            required
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="form-label">Handle</label>
          <input
            type="text"
            required
            className="form-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />

          <label className="form-label">Bio (Max 100 Characters)</label>
          <textarea
            required
            maxLength={100}
            className="form-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <div className="divider-line"></div>

          <label className="form-label">Change Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="divider-line"></div>

          <button
            type="button"
            className="settings-delete-account-btn"
            onClick={handleDeleteAccount}
            disabled={updating}
          >
            Delete account
          </button>
        </form>
      </main>
    </div>
  );
}
