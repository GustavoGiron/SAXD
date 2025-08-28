import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import interactionService from '../services/interactionService';
import FavoritesList from '../components/favorites/FavoritesList';
import WatchLaterList from '../components/watchlater/WatchLaterList';

const MyListsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlater'>('favorites');
  const [favorites, setFavorites] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadLists();
    }
  }, [user]);

  const loadLists = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');
    try {
      const [favResponse, watchResponse] = await Promise.all([
        interactionService.getFavorites(user.id),
        interactionService.getWatchLater(user.id)
      ]);
      
      setFavorites(favResponse.data || []);
      setWatchLater(watchResponse.data || []);
    } catch (err: any) {
      setError('Error al cargar las listas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (contentId: number) => {
    if (!user?.id) return;
    
    try {
      await interactionService.removeFavorite(user.id, contentId);
      setFavorites(favorites.filter((f: any) => f.id_contenido !== contentId));
    } catch (err) {
      console.error('Error al eliminar de favoritos:', err);
    }
  };

  const handleRemoveWatchLater = async (contentId: number) => {
    if (!user?.id) return;
    
    try {
      await interactionService.removeWatchLater(user.id, contentId);
      setWatchLater(watchLater.filter((w: any) => w.id_contenido !== contentId));
    } catch (err) {
      console.error('Error al eliminar de ver luego:', err);
    }
  };

  const handleMoveToFavorites = async (contentId: number) => {
    if (!user?.id) return;
    
    try {
      await interactionService.moveToFavorites(user.id, contentId);
      const item = watchLater.find((w: any) => w.id_contenido === contentId);
      if (item) {
        setWatchLater(watchLater.filter((w: any) => w.id_contenido !== contentId));
        setFavorites([...favorites, item]);
      }
    } catch (err) {
      console.error('Error al mover a favoritos:', err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando tus listas...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="container">
      <h1>Mis Listas</h1>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ Favoritos ({favorites.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'watchlater' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlater')}
        >
          ⏰ Ver Luego ({watchLater.length})
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'favorites' ? (
          <FavoritesList 
            favorites={favorites} 
            onRemove={handleRemoveFavorite}
          />
        ) : (
          <WatchLaterList 
            items={watchLater}
            onRemove={handleRemoveWatchLater}
            onMoveToFavorites={handleMoveToFavorites}
          />
        )}
      </div>
    </div>
  );
};

export default MyListsPage;