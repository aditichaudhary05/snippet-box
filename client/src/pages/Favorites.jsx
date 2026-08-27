import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import useStore from '../store';
import SnippetGrid from '../components/SnippetGrid';
import EmptyState from '../components/EmptyState';
import SkeletonCard from '../components/SkeletonCard';

export default function Favorites() {
  const [loading, setLoading] = useState(true);
  const { snippets, fetchSnippets } = useStore();

  useEffect(() => {
    fetchSnippets({ favorite: 'true', limit: 50 }).finally(() => setLoading(false));
  }, []);

  const favSnippets = snippets.filter(s => s.isFavorite);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 className="page-title">
          <Heart size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
          Favorites
        </h1>
        <p className="page-subtitle">{favSnippets.length} snippet{favSnippets.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : favSnippets.length > 0 ? (
        <SnippetGrid snippets={favSnippets} />
      ) : (
        <EmptyState
          title="No favorites yet"
          description="Heart a snippet to add it to your favorites."
          icon={Heart}
        />
      )}
    </div>
  );
}
