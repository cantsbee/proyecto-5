function createHero() {
    return `
        <section class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">Descubre nueva música conmigo ✨</h1>
                <p class="hero-subtitle">Reviews, playlists y todo sobre mis canciones favoritas</p>
                <div class="hero-buttons">
                    <button class="btn-primary">Ver últimos posts</button>
                    <button class="btn-secondary">Playlists</button>
                </div>
            </div>
            
            <!-- Sección de perfil de Spotify (oculta por defecto) -->
            <div id="spotify-profile" class="spotify-profile" style="display: none;">
                <div class="profile-card">
                    <div id="avatar" class="profile-avatar"></div>
                    <div class="profile-info">
                        <h3 id="displayName">Usuario</h3>
                        <p id="email">email@ejemplo.com</p>
                        <p class="profile-details">
                            <span>ID: </span><span id="id">-</span><br>
                            <span>URI: </span><a id="uri" href="#" target="_blank">-</a><br>
                            <span>URL: </span><a id="url" href="#" target="_blank">-</a>
                        </p>
                        <p id="imgUrl" style="display: none;"></p>
                    </div>
                </div>
            </div>
            
            <div class="featured-content">
                <div class="music-cards">
                    <div class="music-card">
                        <div class="card-image">🎧</div>
                        <h3>Playlist del mes</h3>
                        <p>Las canciones que no paro de escuchar</p>
                    </div>
                    <div class="music-card">
                        <div class="card-image">⭐</div>
                        <h3>Último review</h3>
                        <p>Mi opinión sobre el nuevo álbum</p>
                    </div>
                    <div class="music-card">
                        <div class="card-image">🎵</div>
                        <h3>Descubrimientos</h3>
                        <p>Artistas nuevos que debes conocer</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

export { createHero };

