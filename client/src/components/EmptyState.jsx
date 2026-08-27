import { FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo, icon: Icon }) {
  const navigate = useNavigate();
  const DisplayIcon = Icon || FileCode;

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <DisplayIcon size={22} />
      </div>
      <div className="empty-title">{title || 'Nothing here yet'}</div>
      <div className="empty-desc">{description || 'Create something to get started.'}</div>
      {actionLabel && actionTo && (
        <button className="btn btn-primary" onClick={() => navigate(actionTo)}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
