import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Plus, Trash2, Hash } from 'lucide-react';
import useStore from '../store';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

export default function Tags() {
  const { tags, fetchTags, createTag, deleteTag, setActiveTag } = useStore();
  const [newTagName, setNewTagName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchTags(); }, []);

  const handleCreate = async () => {
    const name = newTagName.trim();
    if (!name) return;
    try {
      await createTag(name);
      toast.success('Tag created');
      setNewTagName('');
      setShowInput(false);
      fetchTags();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create tag');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTag(deleteTarget.id);
      toast.success('Tag deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete tag');
    }
  };

  const handleTagClick = (tag) => {
    setActiveTag(tag.name || tag);
    navigate('/app/snippets');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 className="page-title">
            <Tag size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
            Tags
          </h1>
          <p className="page-subtitle">{tags.length} tag{tags.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-add-snippet" onClick={() => setShowInput(true)}>
          <Plus size={16} /> New Tag
        </button>
      </div>

      {showInput && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
          <input
            className="input input-engraved"
            placeholder="Tag name..."
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
            style={{ maxWidth: 240 }}
          />
          <button className="btn btn-primary btn-sm" onClick={handleCreate}>Create</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setShowInput(false); setNewTagName(''); }}>Cancel</button>
        </div>
      )}

      {tags.length > 0 ? (
        <div className="tags-grid">
          {tags.map(tag => (
            <div key={tag.id} className="tag-card" onClick={() => handleTagClick(tag)}>
              <div className="tag-icon-wrap">
                <Hash size={16} />
              </div>
              <div className="tag-info">
                <div className="tag-name">{tag.name}</div>
                <div className="tag-count">{tag.snippetCount || 0} snippet{(tag.snippetCount || 0) !== 1 ? 's' : ''}</div>
              </div>
              <button
                className="btn btn-ghost btn-icon"
                style={{ flexShrink: 0 }}
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(tag); }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tags yet"
          description="Create tags to organize your snippets."
          icon={Tag}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Tag"
          message={`Delete the tag "${deleteTarget.name}"? This won't delete associated snippets.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
