import { useNavigate } from 'react-router-dom';
import FavoriteButton from './FavoriteButton';
import { ACCENT_COLORS, timeAgo } from '../utils';
import useStore from '../store';

export default function SnippetCard({ snippet, selected, onSelect }) {
  const navigate = useNavigate();
  const { toggleFavorite, languageColorMap } = useStore();

  const langColor = languageColorMap[snippet.language] || ACCENT_COLORS[0];

  const handleClick = () => {
    navigate(`/app/snippets/${snippet.id}`);
  };

  return (
    <div className={`card snippet-card${selected ? ' selected' : ''}`} onClick={handleClick}>
      <div className="card-top">
        <div className="lang-label">
          <span className="lang-dot" style={{ background: langColor }} />
          <span>{snippet.language}</span>
          {snippet.category && <span style={{ opacity: 0.5 }}>/ {snippet.category}</span>}
        </div>
        <FavoriteButton
          isFavorite={snippet.isFavorite}
          onClick={() => toggleFavorite(snippet.id)}
          size={14}
        />
      </div>

      <div className="card-title">{snippet.title}</div>

      {snippet.description && (
        <div className="card-desc">{snippet.description}</div>
      )}

      {snippet.tags && snippet.tags.length > 0 && (
        <div className="card-tags">
          {snippet.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag-pill">{tag.name || tag}</span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="tag-pill">+{snippet.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="card-footer">
        <span className="card-meta">{timeAgo(snippet.updatedAt || snippet.createdAt)}</span>
        {snippet.copy_count > 0 && (
          <span className="card-meta">{snippet.copy_count} copies</span>
        )}
      </div>
    </div>
  );
}
