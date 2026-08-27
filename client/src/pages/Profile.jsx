import { useEffect, useState } from 'react';
import { User, Code, Heart, Tag, Camera, Save } from 'lucide-react';
import useStore from '../store';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';
import api from '../api';

export default function Profile() {
  const { user, snippets, tags, fetchSnippets, fetchTags } = useStore();
  const [description, setDescription] = useState(user?.description || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSnippets({ limit: 100 });
    fetchTags();
  }, []);

  useEffect(() => {
    setDescription(user?.description || '');
    setProfilePicture(user?.profilePicture || '');
  }, [user]);

  const favCount = snippets.filter(s => s.is_favorite).length;
  const langSet = new Set(snippets.map(s => s.language));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/auth/me', { name: user.name, description, profilePicture });
      useStore.setState({ user: res.data });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handlePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="profile-header-card">
        <div style={{ position: 'relative' }}>
          <div className="profile-avatar">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              user?.name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <label className="profile-picture-upload" htmlFor="profile-picture-input">
            <Camera size={14} />
          </label>
          <input
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handlePictureUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{user?.name || 'User'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6 }}>{user?.email || ''}</p>
          {user?.createdAt && (
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 8 }}>
              Member since {formatDate(user.createdAt)}
            </p>
          )}
        </div>
      </div>

      <div className="settings-section" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Bio</h3>
        <textarea
          className="input"
          placeholder="Tell us about yourself..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          style={{ resize: 'vertical', minHeight: 80 }}
        />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Bio'}
          </button>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="stat-value">{snippets.length}</div>
          <div className="stat-label">Snippets</div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-value">{favCount}</div>
          <div className="stat-label">Favorites</div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-value">{langSet.size}</div>
          <div className="stat-label">Languages</div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Languages Used</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[...langSet].map(lang => (
            <span key={lang} className="tag-pill">{lang}</span>
          ))}
          {langSet.size === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No snippets yet</p>}
        </div>
      </div>
    </div>
  );
}
