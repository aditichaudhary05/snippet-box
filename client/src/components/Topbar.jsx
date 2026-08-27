import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Code, Heart, Tag, FolderOpen, Search, Plus } from 'lucide-react';
import useStore from '../store';

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/snippets', icon: Code, label: 'My Snippets' },
  { to: '/app/favorites', icon: Heart, label: 'Favorites' },
  { to: '/app/tags', icon: Tag, label: 'Tags' },
  { to: '/app/collections', icon: FolderOpen, label: 'Collections' },
];

export default function Topbar() {
  const { user, toggleCommandPalette } = useStore();
  const navigate = useNavigate();
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="SnippetBox" className="logo-icon" />
          <span className="logo-name">SnippetBox</span>
        </div>
      </div>

      <nav className="topbar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `topbar-nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="topbar-right">
        <button className="topbar-search-btn" onClick={toggleCommandPalette}>
          <span className="topbar-search-text">Search</span>
          <Search size={16} className="topbar-search-icon" />
        </button>

        <button className="topbar-user-pill" onClick={() => navigate('/app/settings')}>
          <div className="avatar-sm">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>
          <span className="topbar-user-name">{user?.name || 'User'}</span>
        </button>

      </div>
    </header>
  );
}
