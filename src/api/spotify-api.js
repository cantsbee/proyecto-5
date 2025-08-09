import SpotifyAuth from './spotify-auth.js';

class SpotifyAPI {
    constructor() {
        this.auth = new SpotifyAuth();
        this.baseUrl = 'https://api.spotify.com/v1';
    }

    async makeRequest(endpoint, options = {}) {
        if (!this.auth.isLoggedIn()) {
            throw new Error('Usuario no autenticado');
        }

        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.auth.getAccessToken()}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en petición a Spotify:', error);
            throw error;
        }
    }

    async getUserProfile() {
        return await this.makeRequest('/me');
    }

    async getUserPlaylists(limit = 20) {
        return await this.makeRequest(`/me/playlists?limit=${limit}`);
    }

    async getTopTracks(timeRange = 'medium_term', limit = 20) {
        return await this.makeRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
    }

    async getTopArtists(timeRange = 'medium_term', limit = 20) {
        return await this.makeRequest(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
    }

    async getRecentlyPlayed(limit = 20) {
        return await this.makeRequest(`/me/player/recently-played?limit=${limit}`);
    }

    async search(query, type = 'track', limit = 20) {
        const encodedQuery = encodeURIComponent(query);
        return await this.makeRequest(`/search?q=${encodedQuery}&type=${type}&limit=${limit}`);
    }

    async getPlaylist(playlistId) {
        return await this.makeRequest(`/playlists/${playlistId}`);
    }

    async getPlaylistTracks(playlistId, limit = 50) {
        return await this.makeRequest(`/playlists/${playlistId}/tracks?limit=${limit}`);
    }

    async getAlbum(albumId) {
        return await this.makeRequest(`/albums/${albumId}`);
    }

    async getArtist(artistId) {
        return await this.makeRequest(`/artists/${artistId}`);
    }

    async getArtistAlbums(artistId, limit = 20) {
        return await this.makeRequest(`/artists/${artistId}/albums?limit=${limit}`);
    }

    async getArtistTopTracks(artistId, country = 'ES') {
        return await this.makeRequest(`/artists/${artistId}/top-tracks?market=${country}`);
    }
}

export default SpotifyAPI;

/* ---------- EJEMPLO DE USO Y RENDERIZADO ---------- */

document.addEventListener('DOMContentLoaded', async () => {
    const api = new SpotifyAPI();
    const container = document.getElementById('lista-playlists');

    try {
        // Obtener playlists del usuario
        const data = await api.getUserPlaylists(10);

        // Pintar en el DOM
        if (data.items && data.items.length > 0) {
            container.innerHTML = data.items
                .map(playlist => `
                    <li>
                        <img src="${playlist.images[0]?.url || ''}" alt="${playlist.name}" width="50" height="50" />
                        ${playlist.name}
                    </li>
                `)
                .join('');
        } else {
            container.innerHTML = '<li>No tienes playlists</li>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<li>Error al cargar playlists</li>';
    }
});
