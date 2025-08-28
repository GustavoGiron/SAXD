import React from 'react';
import WatchLaterCard from './WatchLaterCard';

interface WatchLaterListProps {
  items: any[];
  onRemove: (contentId: number) => void;
  onMoveToFavorites: (contentId: number) => void;
}

const WatchLaterList: React.FC<WatchLaterListProps> = ({ 
  items, 
  onRemove, 
  onMoveToFavorites 
}) => {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⏰</div>
        <h3>No tienes contenido en Ver Luego</h3>
        <p>Agrega contenido para verlo más tarde</p>
      </div>
    );
  }

  return (
    <div className="content-grid">
      {items.map(item => (
        <WatchLaterCard
          key={item.id || item.id_contenido}
          item={item}
          onRemove={onRemove}
          onMoveToFavorites={onMoveToFavorites}
        />
      ))}
    </div>
  );
};

export default WatchLaterList;