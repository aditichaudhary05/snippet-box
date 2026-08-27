import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, Check, ChevronLeft, Pencil } from 'lucide-react';
import useStore from '../store';
import SnippetGrid from '../components/SnippetGrid';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import api from '../api';

export default function Collections() {
  const { collections, fetchCollections, snippets, fetchSnippets } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedSnippets, setSelectedSnippets] = useState(new Set());
  const [activeCollection, setActiveCollection] = useState(null);
  const [collectionSnippets, setCollectionSnippets] = useState([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [editingCollection, setEditingCollection] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSelectedSnippets, setEditSelectedSnippets] = useState(new Set());

  useEffect(() => { fetchCollections(); fetchSnippets({ limit: 100 }); }, []);

  const handleCollectionClick = async (col) => {
    setActiveCollection(col);
    setLoadingCollection(true);
    try {
      const res = await api.get(`/api/collections/${col.id}`);
      setCollectionSnippets(res.data.snippets || []);
    } catch {
      toast.error('Failed to load collection');
    }
    setLoadingCollection(false);
  };

  const handleRemoveSnippet = async (snippetId) => {
    try {
      await api.delete(`/api/collections/${activeCollection.id}/snippets/${snippetId}`);
      setCollectionSnippets(prev => prev.filter(s => s.id !== snippetId));
      fetchCollections();
      toast.success('Snippet removed');
    } catch {
      toast.error('Failed to remove snippet');
    }
  };

  const handleEditCollection = async () => {
    if (!editName.trim()) return;
    try {
      await api.put(`/api/collections/${activeCollection.id}`, { name: editName.trim(), description: editDescription.trim() });
      if (editSelectedSnippets.size > 0) {
        await api.post(`/api/collections/${activeCollection.id}/snippets`, { snippetIds: [...editSelectedSnippets] });
      }
      setActiveCollection({ ...activeCollection, name: editName.trim(), description: editDescription.trim() });
      setEditingCollection(false);
      setEditSelectedSnippets(new Set());
      fetchCollections();
      handleCollectionClick(activeCollection);
      toast.success('Collection updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update collection');
    }
  };

  const toggleEditSnippet = (id) => {
    const next = new Set(editSelectedSnippets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setEditSelectedSnippets(next);
  };

  const toggleSnippet = (id) => {
    const next = new Set(selectedSnippets);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSnippets(next);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const res = await api.post('/api/collections', { name: name.trim(), description: description.trim() });
      if (selectedSnippets.size > 0) {
        await api.post(`/api/collections/${res.data.id}/snippets`, { snippetIds: [...selectedSnippets] });
      }
      toast.success('Collection created');
      setName('');
      setDescription('');
      setSelectedSnippets(new Set());
      setShowCreate(false);
      fetchCollections();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create collection');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/collections/${deleteTarget.id}`);
      toast.success('Collection deleted');
      setDeleteTarget(null);
      fetchCollections();
    } catch {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div>
      {activeCollection ? (
        <>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => { setActiveCollection(null); setCollectionSnippets([]); setEditingCollection(false); }}>
            <ChevronLeft size={16} /> Back
          </button>
          {editingCollection ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                className="input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
              />
              <input
                className="input"
                placeholder="Description (optional)"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
              />
              {snippets.length > 0 && (
                <div>
                  <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Add More Snippets</label>
                  <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, padding: 8, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    {snippets.filter(s => !collectionSnippets.find(cs => cs.id === s.id)).map(s => (
                      <div
                        key={s.id}
                        onClick={() => toggleEditSnippet(s.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                          background: editSelectedSnippets.has(s.id) ? 'var(--accent-dim)' : 'transparent',
                          border: editSelectedSnippets.has(s.id) ? '1px solid var(--accent-border)' : '1px solid transparent',
                          transition: 'all 150ms ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{s.title}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.language}</span>
                        </div>
                        {editSelectedSnippets.has(s.id) && <Check size={14} style={{ color: 'var(--accent)' }} />}
                      </div>
                    ))}
                  </div>
                  {editSelectedSnippets.size > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      {editSelectedSnippets.size} snippet{editSelectedSnippets.size !== 1 ? 's' : ''} to add
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleEditCollection}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingCollection(false); setEditSelectedSnippets(new Set()); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h1 className="page-title">
                    <FolderOpen size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
                    {activeCollection.name}
                  </h1>
                  {activeCollection.description && <p className="page-subtitle">{activeCollection.description}</p>}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setEditingCollection(true); setEditName(activeCollection.name); setEditDescription(activeCollection.description || ''); }}
                >
                  <Pencil size={14} /> Edit
                </button>
              </div>
              {loadingCollection ? (
                <div className="card-grid">
                  {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : collectionSnippets.length > 0 ? (
                <SnippetGrid snippets={collectionSnippets} />
              ) : (
                <EmptyState
                  title="No snippets in this collection"
                  description="Add snippets when creating a collection."
                  icon={FolderOpen}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 className="page-title">
                <FolderOpen size={20} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom', color: 'var(--accent)' }} />
                Collections
              </h1>
              <p className="page-subtitle">{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> New Collection
            </button>
          </div>

          {showCreate && (
            <div className="neumorphic-raised" style={{ padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="input"
                placeholder="Collection name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
              <textarea
                className="textarea"
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
              {snippets.length > 0 && (
                <div>
                  <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Add Snippets (optional)</label>
                  <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, padding: 8, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    {snippets.map(s => (
                      <div
                        key={s.id}
                        onClick={() => toggleSnippet(s.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                          background: selectedSnippets.has(s.id) ? 'var(--accent-dim)' : 'transparent',
                          border: selectedSnippets.has(s.id) ? '1px solid var(--accent-border)' : '1px solid transparent',
                          transition: 'all 150ms ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{s.title}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.language}</span>
                        </div>
                        {selectedSnippets.has(s.id) && <Check size={14} style={{ color: 'var(--accent)' }} />}
                      </div>
                    ))}
                  </div>
                  {selectedSnippets.size > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      {selectedSnippets.size} snippet{selectedSnippets.size !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleCreate}>Create</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowCreate(false); setName(''); setDescription(''); setSelectedSnippets(new Set()); }}>Cancel</button>
              </div>
            </div>
          )}

          {collections.length > 0 ? (
            <div className="collections-grid">
              {collections.map(col => (
                <div key={col.id} className="collection-card" onClick={() => handleCollectionClick(col)}>
                  <div className="collection-icon">
                    <FolderOpen size={20} />
                  </div>
                  <div className="collection-name">{col.name}</div>
                  {col.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{col.description}</div>}
                  <div className="collection-count">{col.snippetCount || 0} snippet{(col.snippetCount || 0) !== 1 ? 's' : ''}</div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(col); }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No collections yet"
              description="Create collections to group related snippets."
              icon={FolderOpen}
            />
          )}
        </>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Collection"
          message={`Delete the collection "${deleteTarget.name}"? Snippets inside will not be deleted.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      )}
    </div>
  );
}
