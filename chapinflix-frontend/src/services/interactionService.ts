import apiService from './api';

class InteractionService {
  // Favoritos
  async getFavorites(profileId: number) {
    const response = await apiService.getInteractionApi()
      .get(`/api/v1/perfil/${profileId}/favoritos`);
    return response.data;
  }

  async addFavorite(profileId: number, contentId: number) {
    const response = await apiService.getInteractionApi()
      .post(`/api/v1/perfil/${profileId}/favoritos`, { id_contenido: contentId });
    return response.data;
  }

  async removeFavorite(profileId: number, contentId: number) {
    const response = await apiService.getInteractionApi()
      .delete(`/api/v1/perfil/${profileId}/favoritos/${contentId}`);
    return response.data;
  }

  async checkFavorite(profileId: number, contentId: number) {
    const response = await apiService.getInteractionApi()
      .get(`/api/v1/perfil/${profileId}/favoritos/${contentId}/verificar`);
    return response.data;
  }

  // Ver Luego
  async getWatchLater(profileId: number) {
    const response = await apiService.getInteractionApi()
      .get(`/api/v1/perfil/${profileId}/verluego`);
    return response.data;
  }

  async addWatchLater(profileId: number, contentId: number) {
    const response = await apiService.getInteractionApi()
      .post(`/api/v1/perfil/${profileId}/verluego`, { id_contenido: contentId });
    return response.data;
  }

  async removeWatchLater(profileId: number, contentId: number) {
    const response = await apiService.getInteractionApi()
      .delete(`/api/v1/perfil/${profileId}/verluego/${contentId}`);
    return response.data;
  }

  async moveToFavorites(profileId: number, contentId: number) {
    const response = await apiService.getInteractionApi()
      .post(`/api/v1/perfil/${profileId}/verluego/${contentId}/mover-favoritos`);
    return response.data;
  }

  // Listas combinadas
  async getCombinedLists(profileId: number, limit: number = 10) {
    const response = await apiService.getInteractionApi()
      .get(`/api/v1/perfil/${profileId}/listas?limit=${limit}`);
    return response.data;
  }
}

export default new InteractionService();