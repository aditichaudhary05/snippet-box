import { useEffect } from 'react';
import useStore from '../store';
import { ArrowUpDown } from 'lucide-react';

export default function FilterBar() {
  const { activeLanguage, setActiveLanguage, sortBy, setSortBy, languages, fetchLanguages } = useStore();

  useEffect(() => {
    fetchLanguages();
  }, []);

  const availableLanguages = ['All', ...languages];

  return (
    <div className="filter-bar">
      {availableLanguages.map(lang => (
        <button
          key={lang}
          className={`filter-pill${activeLanguage === lang ? ' active' : ''}`}
          onClick={() => setActiveLanguage(lang)}
        >
          {lang}
        </button>
      ))}
      <div className="separator" />
      <select
        className="sort-select"
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
      >
        <option value="favorites_first">Most Favorited</option>
        <option value="created_at_desc">Newest</option>
        <option value="updated_at_desc">Recently Updated</option>
        <option value="title_asc">A → Z</option>
        <option value="title_desc">Z → A</option>
      </select>
    </div>
  );
}
