import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Code, Heart, Tag, FolderOpen, Settings, ChevronRight, LogOut, ExternalLink } from 'lucide-react';
import useStore from '../store';

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/snippets', icon: Code, label: 'My Snippets' },
  { to: '/app/favorites', icon: Heart, label: 'Favorites' },
  { to: '/app/tags', icon: Tag, label: 'Tags' },
  { to: '/app/collections', icon: FolderOpen, label: 'Collections' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

const languageShortcuts = [
  { lang: 'JavaScript', color: '#F7DF1E' },
  { lang: 'React', color: '#61DAFB' },
  { lang: 'Python', color: '#3776AB' },
  { lang: 'TypeScript', color: '#3178C6' },
  { lang: 'CSS', color: '#1572B6' },
];

export default function Sidebar() {
  const { user, logout, setActiveLanguage } = useStore();
  const navigate = useNavigate();
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Code size={16} />
        </div>
        <div className="logo-text">
          <span className="logo-name">SnippetBox</span>
          <span className="logo-tagline">Your code. Organized.</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label">Quick Languages</div>
        {languageShortcuts.map(l => (
          <button
            key={l.lang}
            className="nav-item"
            onClick={() => { setActiveLanguage(l.lang); navigate('/app/snippets'); }}
          >
            <span className="lang-dot" style={{ background: l.color, width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }} />
            <span>{l.lang}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            initial
          )}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-role">Code Enthusiast</div>
        </div>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ width: 28, height: 28 }} title="GitHub">
          <ExternalLink size={14} />
        </a>
        <button className="btn-icon" onClick={handleLogout} title="Logout" style={{ width: 28, height: 28 }}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
