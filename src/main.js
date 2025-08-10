import { createHeader } from './components/header.js';
import { createHero } from './components/hero.js';
import { createFooter } from './components/footer.js';

// Variables globales
let currentProfile = null;
const clientId = "da6c869ff792411388e5dce6c6032054";

async function loadApp() {
    const headerElement = document.getElementById('header');
    const heroElement = document.getElementById('hero');
    const footerElement = document.getElementById('footer');

    headerElement.innerHTML = createHeader();
    heroElement.innerHTML = createHero();
    footerElement.innerHTML = createFooter();

    setupEventListeners();
    
    // Verificar si hay código de autorización en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        try {
            const accessToken = await getAccessToken(clientId, code);
            localStorage.setItem("spotify_access_token", accessToken);
            const profile = await fetchProfile(accessToken);
            updateUIWithProfile(profile);
            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error durante la autenticación:', error);
        }
    }
    
    updateLoginButton();
}

function setupEventListeners() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleSpotifyLogin);
    }

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Navegando a:', link.textContent);
        });
    });

    // Botones del hero
    const primaryBtn = document.querySelector('.btn-primary');
    const secondaryBtn = document.querySelector('.btn-secondary');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', showLatestPosts);
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', showPlaylists);
    }
}

function handleSpotifyLogin() {
    if (isLoggedIn()) {
        clearTokens();
        currentProfile = null;
        updateLoginButton();
        updateUIWithProfile(null);
        console.log('Sesión cerrada');
    } else {
        redirectToAuthCodeFlow(clientId);
    }
}

function updateLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        if (isLoggedIn()) {
            loginBtn.textContent = 'Desconectar';
            loginBtn.style.background = 'linear-gradient(45deg, #00b894, #00cec9)';
        } else {
            loginBtn.textContent = 'Conectar Spotify';
            loginBtn.style.background = 'linear-gradient(45deg, #fd79a8, #fdcb6e)';
        }
    }
}

function updateUIWithProfile(profile) {
    if (profile) {
        // Actualizar el header con información del usuario
        const logo = document.querySelector('.logo h2');
        if (logo) {
            logo.innerHTML = `🎵 Hola, ${profile.display_name}!`;
        }
        
        // Mostrar y poblar la sección de perfil
        const profileSection = document.getElementById('spotify-profile');
        if (profileSection) {
            profileSection.style.display = 'block';
            populateUI(profile);
        }
        
        // Mostrar información del perfil en una notificación
        showProfileInfo(profile);
    } else {
        // Restaurar el logo original
        const logo = document.querySelector('.logo h2');
        if (logo) {
            logo.innerHTML = '🎵 Music Vlog';
        }
        
        // Ocultar la sección de perfil
        const profileSection = document.getElementById('spotify-profile');
        if (profileSection) {
            profileSection.style.display = 'none';
        }
    }
}

// Función populateUI del código original (adaptada)
function populateUI(profile) {
    const displayNameEl = document.getElementById("displayName");
    const avatarEl = document.getElementById("avatar");
    const imgUrlEl = document.getElementById("imgUrl");
    const idEl = document.getElementById("id");
    const emailEl = document.getElementById("email");
    const uriEl = document.getElementById("uri");
    const urlEl = document.getElementById("url");

    if (displayNameEl) displayNameEl.innerText = profile.display_name || 'Usuario';
    
    if (profile.images?.[0]?.url && avatarEl) {
        avatarEl.innerHTML = ''; // Limpiar contenido anterior
        const img = new Image(100, 100);
        img.src = profile.images[0].url;
        img.alt = 'Avatar de ' + profile.display_name;
        avatarEl.appendChild(img);
        if (imgUrlEl) imgUrlEl.innerText = profile.images[0].url;
    }
    
    if (idEl) idEl.innerText = profile.id || '-';
    if (emailEl) emailEl.innerText = profile.email || 'No disponible';
    
    if (uriEl) {
        uriEl.innerText = profile.uri || '-';
        uriEl.href = profile.external_urls?.spotify || '#';
    }
    
    if (urlEl) {
        urlEl.innerText = profile.href || '-';
        urlEl.href = profile.href || '#';
    }
}

// Funciones de autenticación PKCE
async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://proyecto-5-iota.vercel.app/");
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://proyecto-5-iota.vercel.app/");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    if (!result.ok) {
        const errorText = await result.text();
        throw new Error("Error al obtener token: " + errorText);
    }

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!result.ok) {
        const errorText = await result.text();
        throw new Error("Error al obtener perfil: " + errorText);
    }

    return await result.json();
}

function isLoggedIn() {
    return !!localStorage.getItem("spotify_access_token");
}

function clearTokens() {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("verifier");
}

// Funciones de ejemplo para usar la API
async function showLatestPosts() {
    if (!isLoggedIn()) {
        alert('Primero conecta tu cuenta de Spotify');
        return;
    }

    try {
        console.log('Cargando últimos posts...');
        const token = localStorage.getItem("spotify_access_token");
        
        const response = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al obtener datos de Spotify');
        }
        
        const topTracks = await response.json();
        console.log('Tus canciones más escuchadas:', topTracks);
        
        displayMusicData('Tus canciones más escuchadas', topTracks.items);
    } catch (error) {
        console.error('Error al cargar posts:', error);
        alert('Error al cargar datos. Verifica tu conexión con Spotify.');
    }
}

async function showPlaylists() {
    if (!isLoggedIn()) {
        alert('Primero conecta tu cuenta de Spotify');
        return;
    }

    try {
        console.log('Cargando playlists...');
        const token = localStorage.getItem("spotify_access_token");
        
        // Primero obtener las playlists del usuario
        const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists?limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!playlistsResponse.ok) {
            throw new Error('Error al obtener playlists de Spotify');
        }
        
        const playlists = await playlistsResponse.json();
        console.log('Tus playlists:', playlists);
        
        if (playlists.items && playlists.items.length > 0) {
            // Obtener las canciones de la primera playlist
            const firstPlaylist = playlists.items[0];
            const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${firstPlaylist.id}/tracks?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (tracksResponse.ok) {
                const tracks = await tracksResponse.json();
                console.log('Canciones de la playlist:', tracks);
                displayMusicData(`Canciones de "${firstPlaylist.name}"`, tracks.items);
            } else {
                // Si no se pueden obtener las canciones, mostrar las playlists
                displayMusicData('Tus playlists', playlists.items);
            }
        } else {
            alert('No tienes playlists disponibles');
        }
    } catch (error) {
        console.error('Error al cargar playlists:', error);
        alert('Error al cargar playlists. Verifica tu conexión con Spotify.');
    }
}

function showProfileInfo(profile) {
    const profileModal = document.createElement('div');
    profileModal.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(253, 121, 168, 0.3);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    let html = `
        <div style="text-align: center;">
            <h3 style="color: #fd79a8; margin-bottom: 1rem;">¡Conectado con Spotify!</h3>
    `;

    if (profile.images && profile.images[0]) {
        html += `<img src="${profile.images[0].url}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 1rem;" alt="Avatar">`;
    }

    html += `
            <p><strong>${profile.display_name}</strong></p>
            <p style="color: #666; font-size: 0.9rem;">${profile.email}</p>
            <button onclick="this.closest('div').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #fd79a8; color: white; border: none; border-radius: 10px; cursor: pointer;">Cerrar</button>
        </div>
    `;

    profileModal.innerHTML = html;
    document.body.appendChild(profileModal);

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (profileModal.parentNode) {
            profileModal.remove();
        }
    }, 5000);
}

function displayMusicData(title, items) {
    // Crear un modal simple para mostrar los datos
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 20px;
        max-width: 500px;
        max-height: 70vh;
        overflow-y: auto;
    `;

    let html = `<h2 style="color: #fd79a8; margin-bottom: 1rem;">${title}</h2>`;
    
    items.forEach((item, index) => {
        // Manejar diferentes estructuras de datos
        let name, artist;
        
        if (item.track) {
            // Es un elemento de playlist que contiene un track
            name = item.track.name || 'Sin nombre';
            artist = item.track.artists && item.track.artists[0] ? item.track.artists[0].name : '';
        } else if (item.name && item.artists) {
            // Es una canción directa (top tracks)
            name = item.name;
            artist = item.artists[0] ? item.artists[0].name : '';
        } else if (item.name && item.owner) {
            // Es una playlist
            name = item.name;
            artist = item.owner.display_name;
        } else {
            // Fallback
            name = item.name || 'Sin nombre';
            artist = '';
        }
        
        html += `
            <div style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <strong>${index + 1}. ${name}</strong>
                ${artist ? `<br><small style="color: #666;">por ${artist}</small>` : ''}
            </div>
        `;
    });

    html += '<button onclick="this.closest(\'.modal\').remove()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #fd79a8; color: white; border: none; border-radius: 10px; cursor: pointer;">Cerrar</button>';
    
    content.innerHTML = html;
    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

document.addEventListener('DOMContentLoaded', loadApp);
