import React from 'react';

interface FavoriteCardProps {
  item: any;
  onRemove: (contentId: number) => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ item, onRemove }) => {
  return (
    <div className="content-card">
      <div className="content-image">
        <span className="content-emoji">🎬</span>
      </div>
      <div className="content-info">
        <h3>{item.titulo || `Contenido ${item.id_contenido}`}</h3>
        <p className="content-type">{item.tipo || 'Película'}</p>
        {item.fecha_agregado && (
          <p className="content-date">
            Agregado: {new Date(item.fecha_agregado).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="content-actions">
        <button 
          className="btn btn-danger btn-sm"
          onClick={() => onRemove(item.id_contenido)}
        >
          ❌ Eliminar
        </button>
      </div>
    </div>
  );
};

export default FavoriteCard;