import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus } from 'lucide-react';
import { LANGUAGES, LANGUAGE_EXTENSIONS } from '../utils';
import useStore from '../store';
import toast from 'react-hot-toast';

export default function SnippetEditor({ existingSnippet, isEdit, isModal, onClose }) {
  const navigate = useNavigate();
  const { createSnippet, updateSnippet, tags: storeTags, fetchTags, incrementCopyCount } = useStore();

  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [langFilter, setLangFilter] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (existingSnippet) {
      setTitle(existingSnippet.title || '');
      setLanguage(existingSnippet.language || 'JavaScript');
      setCode(existingSnippet.code || '');
      setDescription(existingSnippet.description || '');
      setSource(existingSnippet.source || '');
      setIsFavorite(existingSnippet.is_favorite || false);
      setTags(existingSnippet.tags?.map(t => t.name || t) || []);
    }
  }, [existingSnippet]);

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!code.trim()) { toast.error('Code is required'); return; }

    setSaving(true);
    try {
      const data = { title: title.trim(), language, code, description: description.trim(), source: source.trim(), tags };
      if (isEdit && existingSnippet) {
        await updateSnippet(existingSnippet.id, data);
        toast.success('Snippet updated');
        if (isModal) onClose();
        else navigate(`/app/snippets/${existingSnippet.id}`);
      } else {
        const created = await createSnippet(data);
        toast.success('Snippet created');
        if (isModal) onClose();
        else navigate(`/app/snippets/${created.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save snippet');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [title, language, code, description, source, tags]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const filteredLangs = LANGUAGES.filter(l => l.toLowerCase().includes(langFilter.toLowerCase()));
  const tagSuggestions = storeTags
    .map(t => t.name || t)
    .filter(n => n.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(n))
    .slice(0, 5);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{isEdit ? 'Edit Snippet' : 'New Snippet'}</h2>
        <div className="editor-toolbar-spacer" />
        <button className="btn btn-ghost" onClick={isModal ? onClose : () => navigate(-1)}>
          <X size={16} /> Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            className="input"
            placeholder="My awesome snippet"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              className="select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Source URL (optional)</label>
            <input
              className="input"
              placeholder="https://..."
              value={source}
              onChange={e => setSource(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Code</label>
          <div className="code-editor-wrapper">
            <div className="code-editor-header">
              <span>{language}{LANGUAGE_EXTENSIONS[language] || ''}</span>
              <span>{code.split('\n').length} lines</span>
            </div>
            <textarea
              placeholder={`Paste your ${language} code here...`}
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="textarea"
            placeholder="Brief description of what this snippet does..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tag-input-wrapper" onClick={() => document.getElementById('tag-input-field')?.focus()}>
            {tags.map(tag => (
              <span key={tag} className="tag-input-tag">
                {tag}
                <span className="remove-tag" onClick={() => removeTag(tag)}>
                  <X size={12} />
                </span>
              </span>
            ))}
            <input
              id="tag-input-field"
              placeholder={tags.length === 0 ? 'Add tags...' : ''}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput.trim()) addTag(); }}
            />
          </div>
          {tagSuggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {tagSuggestions.map(s => (
                <button key={s} className="tag-pill" style={{ cursor: 'pointer' }} onClick={() => { setTags([...tags, s]); setTagInput(''); }}>
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
