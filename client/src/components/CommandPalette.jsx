import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Plus, Heart, Clock, Tag, Settings, LogOut } from 'lucide-react';
import useStore from '../store';

const actions = [
  { id: 'search', label: 'Search snippets', icon: Search, shortcut: '⌘K' },
  { id: 'create', label: 'Create snippet', icon: Plus, shortcut: '⌘N' },
  { id: 'favorites', label: 'View favorites', icon: Heart },
  { id: 'tags', label: 'Go to tags', icon: Tag },
  { id: 'settings', label: 'Go to settings', icon: Settings },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

export default function CommandPalette() {
  const { showCommandPalette, toggleCommandPalette, logout, globalSearch } = useStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (showCommandPalette) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showCommandPalette]);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(async () => {
        const res = await globalSearch(query);
        setResults(res?.snippets || []);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!showCommandPalette) return null;

  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (action) => {
    toggleCommandPalette();
    switch (action.id) {
      case 'create': navigate('/app/snippets/new'); break;
      case 'favorites': navigate('/app/favorites'); break;
      case 'tags': navigate('/app/tags'); break;
      case 'settings': navigate('/app/settings'); break;
      case 'logout': logout(); navigate('/'); break;
    }
  };

  const handleSnippetClick = (id) => {
    toggleCommandPalette();
    navigate(`/app/snippets/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      toggleCommandPalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredActions.length + results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredActions.length) {
        handleSelect(filteredActions[selectedIndex]);
      } else {
        const snippetIdx = selectedIndex - filteredActions.length;
        if (results[snippetIdx]) handleSnippetClick(results[snippetIdx].id);
      }
    }
  };

  const totalItems = filteredActions.length + results.length;

  return (
    <div className="command-palette-overlay" onClick={(e) => e.target === e.currentTarget && toggleCommandPalette()}>
      <div className="command-palette" onKeyDown={handleKeyDown}>
        <div className="palette-input-wrapper">
          <Search size={18} />
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
        </div>
        <div className="palette-results">
          {filteredActions.map((action, i) => (
            <div
              key={action.id}
              className={`palette-item${i === selectedIndex ? ' selected' : ''}`}
              onClick={() => handleSelect(action)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <action.icon size={16} />
              <span>{action.label}</span>
              {action.shortcut && <span className="palette-shortcut">{action.shortcut}</span>}
            </div>
          ))}
          {results.length > 0 && (
            <>
              {filteredActions.length > 0 && <div style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Snippets</div>}
              {results.map((snippet, i) => {
                const idx = filteredActions.length + i;
                return (
                  <div
                    key={snippet.id}
                    className={`palette-item${idx === selectedIndex ? ' selected' : ''}`}
                    onClick={() => handleSnippetClick(snippet.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Code size={16} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{snippet.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{snippet.language}</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {query.length >= 2 && filteredActions.length === 0 && results.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
