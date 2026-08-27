import { Heart } from 'lucide-react';

export default function FavoriteButton({ isFavorite, onClick, size = 16 }) {
  return (
    <button
      className={`btn-icon${isFavorite ? ' active' : ''}`}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart size={size} fill={isFavorite ? 'currentColor' : 'none'} />
    </button>
  );
}
