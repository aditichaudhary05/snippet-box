import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store';
import SnippetGrid from '../components/SnippetGrid';
import FilterBar from '../components/FilterBar';
import SkeletonCard from '../components/SkeletonCard';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Snippets() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { snippets, fetchSnippets, totalSnippets, currentPage, setCurrentPage, fetchSnippet, setDetailPanelOpen, selectedSnippets, setSelectedSnippets, searchQuery, setSearchQuery, toggleCreateModal, activeLanguage, sortBy } = useStore();
  const [loading, setLoading] = useState(true);

  const limit = 12;
  const totalPages = Math.ceil(totalSnippets / limit);

  useEffect(() => {
    if (id) {
      fetchSnippet(id).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeLanguage, sortBy]);

  useEffect(() => {
    setLoading(true);
    fetchSnippets({ page: currentPage }).finally(() => setLoading(false));
  }, [currentPage, searchQuery, activeLanguage, sortBy]);

  const handleToggleSelect = (snippetId) => {
    const newSet = new Set(selectedSnippets);
    if (newSet.has(snippetId)) newSet.delete(snippetId);
    else newSet.add(snippetId);
    setSelectedSnippets(newSet);
  };

  const handleBulkDelete = async () => {
    const { deleteSnippet } = useStore.getState();
    for (const id of selectedSnippets) {
      await deleteSnippet(id).catch(() => {});
    }
    setSelectedSnippets(new Set());
    fetchSnippets({ page: currentPage });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <h1 className="page-title">My Snippets</h1>
          <p className="page-subtitle">{totalSnippets} snippet{totalSnippets !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn-add-snippet" onClick={toggleCreateModal}>
          <Plus size={16} />
          <span>New Snippet</span>
        </button>
      </div>

      <FilterBar />

      {selectedSnippets.size > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-count">{selectedSnippets.size} selected</span>
          <div style={{ flex: 1 }} />
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            Delete Selected
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSnippets(new Set())}>
            Clear
          </button>
        </div>
      )}

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <SnippetGrid
          snippets={snippets}
          selectedSnippets={selectedSnippets}
          onToggleSelect={selectedSnippets.size > 0 ? handleToggleSelect : undefined}
        />
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`page-btn${currentPage === page ? ' active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
