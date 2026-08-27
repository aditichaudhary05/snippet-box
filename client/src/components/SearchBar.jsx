import { Search } from 'lucide-react';
import useStore from '../store';

export default function SearchBar() {
  const { toggleCommandPalette } = useStore();

  return (
    <div className="search-wrapper" onClick={toggleCommandPalette} style={{ cursor: 'pointer' }}>
      <Search className="search-icon" size={16} />
      <input
        className="input input-search"
        placeholder="Search snippets, tags, languages..."
        readOnly
        style={{ cursor: 'pointer' }}
      />
      <span className="kbd-badge">⌘K</span>
    </div>
  );
}
