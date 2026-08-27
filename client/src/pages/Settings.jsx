import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, LogOut, Download, Upload, Trash2, User, Key, Palette, Keyboard, Database, Info, Eye, EyeOff, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportAsJSON } from '../utils';
import toast from 'react-hot-toast';
import api from '../api';

export default function Settings() {
  const { user, logout, snippets, fetchSnippets } = useStore();
  const navigate = useNavigate();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showClearSnippets, setShowClearSnippets] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [description, setDescription] = useState(user?.description || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [defaultLanguage, setDefaultLanguage] = useState(localStorage.getItem('defaultLanguage') || 'JavaScript');
  const [snippetsPerPage, setSnippetsPerPage] = useState(localStorage.getItem('snippetsPerPage') || '12');
  const [showLineNumbers, setShowLineNumbers] = useState(localStorage.getItem('showLineNumbers') !== 'false');

  useEffect(() => {
    setName(user?.name || '');
    setDescription(user?.description || '');
    setProfilePicture(user?.profilePicture || '');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('defaultLanguage', defaultLanguage);
    localStorage.setItem('snippetsPerPage', snippetsPerPage);
    localStorage.setItem('showLineNumbers', showLineNumbers);
  }, [defaultLanguage, snippetsPerPage, showLineNumbers]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportJSON = () => {
    const data = exportAsJSON(snippets);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippetbox-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON');
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        let imported = 0;
        for (const snippet of data) {
          try {
            await api.post('/api/snippets', {
              title: snippet.title || 'Untitled',
              code: snippet.code || '',
              language: snippet.language || 'JavaScript',
              description: snippet.description || '',
              tags: snippet.tags || []
            });
            imported++;
          } catch {}
        }
        toast.success(`Imported ${imported} snippets`);
        fetchSnippets();
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    input.click();
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await api.put('/api/auth/me', { name: name.trim(), description: description.trim(), profilePicture });
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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Fill in all password fields'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      await api.put('/api/auth/password', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    }
    setChangingPassword(false);
  };

  const handleClearAllSnippets = async () => {
    try {
      for (const s of snippets) {
        await api.delete(`/api/snippets/${s.id}`).catch(() => {});
      }
      toast.success('All snippets deleted');
      setShowClearSnippets(false);
      fetchSnippets();
    } catch {
      toast.error('Failed to clear snippets');
    }
  };

  const languages = [
    'JavaScript', 'TypeScript', 'React', 'Python', 'Java', 'C', 'C++', 'C#',
    'Go', 'Rust', 'PHP', 'HTML', 'CSS', 'SQL', 'Bash', 'JSON', 'Markdown'
  ];

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>
        <SettingsIcon size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
        Settings
      </h1>

      <div className="settings-grid">
        <div className="settings-section">
          <h3><User size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />Profile</h3>
          <div className="settings-row">
            <div className="settings-label">Name</div>
            <div className="settings-input">
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Email</div>
            <div className="settings-input">
              <input className="input" defaultValue={user?.email || ''} readOnly style={{ opacity: 0.6 }} />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Bio</div>
            <div className="settings-input">
              <input className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell us about yourself..." />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Profile Picture</div>
            <div className="settings-input" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--accent-border)', flexShrink: 0 }}>
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--accent)', fontSize: 18, fontWeight: 700 }}>{user?.name?.[0]?.toUpperCase() || '?'}</span>
                )}
              </div>
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                <Camera size={14} /> Upload
                <input type="file" accept="image/*" onChange={handlePictureUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={handleUpdateProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3><Key size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />Change Password</h3>
          <div className="settings-row">
            <div className="settings-label">Current Password</div>
            <div className="settings-input" style={{ position: 'relative' }}>
              <input className="input" type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">New Password</div>
            <div className="settings-input">
              <input className="input" type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Confirm New Password</div>
            <div className="settings-input">
              <input className="input" type={showPasswords ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={handleChangePassword} disabled={changingPassword}>
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPasswords(!showPasswords)}>
              {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />} {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3><Palette size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />Preferences</h3>
          <div className="settings-row">
            <div className="settings-label">Default Language</div>
            <div className="settings-input">
              <select className="select" value={defaultLanguage} onChange={e => setDefaultLanguage(e.target.value)}>
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Snippets Per Page</div>
            <div className="settings-input">
              <select className="select" value={snippetsPerPage} onChange={e => setSnippetsPerPage(e.target.value)}>
                <option value="6">6</option>
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-label">Show Line Numbers</div>
            <div className="settings-input">
              <button
                className={`btn btn-sm ${showLineNumbers ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setShowLineNumbers(!showLineNumbers)}
              >
                {showLineNumbers ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3><Keyboard size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />Keyboard Shortcuts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { keys: 'Ctrl + K', action: 'Open search / Command palette' },
              { keys: 'Ctrl + N', action: 'Create new snippet' },
              { keys: 'Ctrl + S', action: 'Save snippet (in editor)' },
            ].map(s => (
              <div key={s.keys} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.action}</span>
                <kbd style={{ fontSize: 11, padding: '2px 8px', background: 'var(--bg-deep)', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>{s.keys}</kbd>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3><Database size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />Data</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleExportJSON}>
              <Download size={16} /> Export as JSON
            </button>
            <button className="btn btn-secondary" onClick={handleImportJSON}>
              <Upload size={16} /> Import JSON
            </button>
            <button className="btn btn-danger" onClick={() => setShowClearSnippets(true)}>
              <Trash2 size={16} /> Clear All Snippets
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3><Info size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />About</h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <div><strong>SnippetBox</strong> v1.0.0</div>
            <div>A code snippet manager for developers.</div>
            <div style={{ marginTop: 4 }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>GitHub</a>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {showClearSnippets && (
        <ConfirmDialog
          title="Clear All Snippets"
          message="This will permanently delete all your snippets. This action cannot be undone."
          confirmLabel="Delete All"
          onConfirm={handleClearAllSnippets}
          onCancel={() => setShowClearSnippets(false)}
          danger
        />
      )}
    </div>
  );
}
