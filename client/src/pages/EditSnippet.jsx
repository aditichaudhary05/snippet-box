import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SnippetEditor from '../components/SnippetEditor';
import useStore from '../store';
import SkeletonCard from '../components/SkeletonCard';

export default function EditSnippet() {
  const { id } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchSnippet } = useStore();

  useEffect(() => {
    fetchSnippet(id).then(data => {
      setSnippet(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonCard />;
  if (!snippet) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Snippet not found</div>;

  return <SnippetEditor existingSnippet={snippet} isEdit />;
}
