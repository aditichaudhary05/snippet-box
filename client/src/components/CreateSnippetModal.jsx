import useStore from '../store';
import SnippetEditor from './SnippetEditor';

export default function CreateSnippetModal() {
  const { createModalOpen, toggleCreateModal } = useStore();

  if (!createModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={toggleCreateModal}>
      <div className="modal-editor" onClick={e => e.stopPropagation()}>
        <SnippetEditor isModal onClose={toggleCreateModal} />
      </div>
    </div>
  );
}
