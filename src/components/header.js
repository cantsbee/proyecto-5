function createHeader() {
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <h2>🎵 FESTIBY</h2>
                </div>
                <ul class="nav-menu">
                    <li><a href="#home">Inicio</a></li>
                    <li><a href="#playlists">Playlists</a></li>
                    <li><a href="#reviews">Reviews</a></li>
                    <li><a href="#about">Sobre mí</a></li>
                </ul>
                <div class="spotify-login">
                    <button id="login-btn" class="login-button">Conectar Spotify</button>
                </div>
            </div>
        </nav>
    `;
}

export { createHeader };

