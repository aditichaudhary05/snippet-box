import { useEffect, useState } from 'react';
import { X, ExternalLink, Copy, Download, Edit, Trash2, Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CodeViewer from './CodeViewer';
import FavoriteButton from './FavoriteButton';
import ConfirmDialog from './ConfirmDialog';
import { LANGUAGE_COLORS, timeAgo, formatDate, downloadFile, exportAsMarkdown } from '../utils';
import useStore from '../store';
import toast from 'react-hot-toast';

export default function SnippetDetail({ snippet }) {
  const navigate = useNavigate();
  const { toggleFavorite, deleteSnippet, duplicateSnippet, setDetailPanelOpen } = useStore();
  const [showDelete, setShowDelete] = useState(false);

  if (!snippet) return null;

  const handleDelete = async () => {
    try {
      await deleteSnippet(snippet.id);
      toast.success('Snippet deleted');
      setShowDelete(false);
    } catch {
      toast.error('Failed to delete snippet');
    }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await duplicateSnippet(snippet.id);
      toast.success('Snippet duplicated');
      navigate(`/app/snippets/${dup.id}/edit`);
    } catch {
      toast.error('Failed to duplicate snippet');
    }
  };

  const handleDownload = () => {
    const ext = snippet.language?.toLowerCase() === 'javascript' ? '.js' :
      snippet.language?.toLowerCase() === 'typescript' ? '.ts' :
      snippet.language?.toLowerCase() === 'python' ? '.py' :
      snippet.language?.toLowerCase() === 'html' ? '.html' :
      snippet.language?.toLowerCase() === 'css' ? '.css' : '.txt';
    downloadFile(snippet.code || '', `${snippet.title}${ext}`);
    toast.success('Downloaded');
  };

  const handleExportMD = () => {
    downloadFile(exportAsMarkdown(snippet), `${snippet.title}.md`);
    toast.success('Exported as Markdown');
  };

  return (
    <>
      <div className="detail-panel">
        <div className="detail-panel-header">
          <button className="btn btn-ghost btn-sm" onClick={() => setDetailPanelOpen(false)}>
            ← Back
          </button>
          <div style={{ flex: 1 }} />
          <FavoriteButton
            isFavorite={snippet.is_favorite}
            onClick={() => toggleFavorite(snippet.id)}
          />
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/app/snippets/${snippet.id}/edit`)}>
            <Edit size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleDuplicate}>
            <Copy size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleDownload}>
            <Download size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowDelete(true)} style={{ color: 'var(--danger)' }}>
            <Trash2 size={14} />
          </button>
          <button className="btn btn-ghost btn-sm detail-panel-close" onClick={() => setDetailPanelOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="detail-panel-body">
          <div className="lang-badge" style={{ marginBottom: 12 }}>
            <span className="lang-dot" style={{ background: LANGUAGE_COLORS[snippet.language] || '#888' }} />
            <span>{snippet.language}</span>
            {snippet.category && <span style={{ opacity: 0.5 }}>/ {snippet.category}</span>}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{snippet.title}</h2>

          {snippet.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              {snippet.description}
            </p>
          )}

          {snippet.tags && snippet.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {snippet.tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  <Hash size={10} />
                  {tag.name || tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, padding: 14, background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Language</span>
              <span style={{ color: 'var(--text-primary)' }}>{snippet.language}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Created</span>
              <span style={{ color: 'var(--text-primary)' }}>{formatDate(snippet.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Updated</span>
              <span style={{ color: 'var(--text-primary)' }}>{timeAgo(snippet.updatedAt || snippet.createdAt)}</span>
            </div>
            {snippet.source && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Source</span>
                <a href={snippet.source} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Link <ExternalLink size={11} />
                </a>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>Copies</span>
              <span style={{ color: 'var(--text-primary)' }}>{snippet.copy_count || 0}</span>
            </div>
          </div>

          <CodeViewer code={snippet.code} language={snippet.language} snippetId={snippet.id} />
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="Delete Snippet"
          message={`Are you sure you want to delete "${snippet.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          danger
        />
      )}
    </>
  );
}
