import SnippetCard from './SnippetCard';
import EmptyState from './EmptyState';
import { Code } from 'lucide-react';

export default function SnippetGrid({ snippets, selectedSnippets, onToggleSelect }) {
  if (!snippets || snippets.length === 0) {
    return (
      <EmptyState
        title="No snippets found"
        description="Create your first snippet to get started."
        actionLabel="Create Snippet"
        actionTo="/app/snippets/new"
        icon={Code}
      />
    );
  }

  return (
    <div className="card-grid">
      {snippets.map(snippet => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          selected={selectedSnippets?.has(snippet.id)}
          onSelect={onToggleSelect ? () => onToggleSelect(snippet.id) : undefined}
        />
      ))}
    </div>
  );
}
