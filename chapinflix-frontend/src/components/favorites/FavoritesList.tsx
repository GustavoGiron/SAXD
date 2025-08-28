import React from 'react';
import FavoriteCard from './FavoriteCard';

interface FavoritesListProps {
  favorites: any[];
  onRemove: (contentId: number) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onRemove }) => {
  if (favorites.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">❤️</div>
        <h3>No tienes favoritos aún</h3>
        <p>Los contenidos que marques como favoritos aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="content-grid">
      {favorites.map(item => (
        <FavoriteCard 
          key={item.id || item.id_contenido} 
          item={item} 
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default FavoritesList;