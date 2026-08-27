import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import Topbar from '../components/Topbar';
import CommandPalette from '../components/CommandPalette';
import CreateSnippetModal from '../components/CreateSnippetModal';
import SnippetDetail from '../components/SnippetDetail';
import Home from './Home';
import Snippets from './Snippets';
import CreateSnippet from './CreateSnippet';
import EditSnippet from './EditSnippet';
import Favorites from './Favorites';
import Tags from './Tags';
import Collections from './Collections';
import Settings from './Settings';
import Profile from './Profile';
import useStore from '../store';

export default function AppLayout() {
  const { currentSnippet, detailPanelOpen, toggleCommandPalette, fetchSnippets, fetchTags, fetchCollections, toggleCreateModal } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSnippets();
    fetchTags();
    fetchCollections();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/app/snippets/new');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-layout-topbar">
      <Topbar />

      <div className="main-content-topbar">
        <div className="main-scroll-topbar">
          <Routes>
            <Route index element={<Home />} />
            <Route path="snippets" element={<Snippets />} />
            <Route path="snippets/:id" element={<Snippets />} />
            <Route path="snippets/:id/edit" element={<EditSnippet />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="tags" element={<Tags />} />
            <Route path="collections" element={<Collections />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>

        {detailPanelOpen && currentSnippet && (
          <SnippetDetail snippet={currentSnippet} />
        )}
      </div>

      <CommandPalette />
      <CreateSnippetModal />

      <nav className="mobile-bottom-nav">
        <button className={`mobile-nav-item${location.pathname === '/app' ? ' active' : ''}`} onClick={() => navigate('/app')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
          <span>Home</span>
        </button>
        <button className={`mobile-nav-item${location.pathname.startsWith('/app/snippets') && !location.pathname.includes('/new') ? ' active' : ''}`} onClick={() => navigate('/app/snippets')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16,18 22,12 16,6"/><polyline points="8,6 2,12 8,18"/></svg>
          <span>Snippets</span>
        </button>
        <button className={`mobile-nav-item${location.pathname === '/app/favorites' ? ' active' : ''}`} onClick={() => navigate('/app/favorites')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Favorites</span>
        </button>
        <button className={`mobile-nav-item${location.pathname === '/app/settings' ? ' active' : ''}`} onClick={() => navigate('/app/settings')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Settings</span>
        </button>
      </nav>

      <button className="mobile-fab" onClick={toggleCreateModal}>
        <Plus size={24} />
      </button>
    </div>
  );
}
