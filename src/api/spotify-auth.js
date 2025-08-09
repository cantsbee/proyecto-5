const clientId = "da6c869ff792411388e5dce6c6032054"; 
const params = new URLSearchParams(window.location.search);
const code = params.get("code");


export async function redirectToAuthCodeFlow(clientId) {
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

export async function getAccessToken(clientId, code) {
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


export async function fetchProfile(token) {
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


export function saveAccessToken(token) {
  localStorage.setItem("spotify_access_token", token);
}

export function getStoredAccessToken() {
  return localStorage.getItem("spotify_access_token");
}

export function clearTokens() {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("verifier");
}

export function isLoggedIn() {
  return !!getStoredAccessToken();
}

export async function initializeAuth() {
  if (!code) {
    return false; 
  } else {
    try {
      const accessToken = await getAccessToken(clientId, code);
      saveAccessToken(accessToken);
      
  
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return accessToken;
    } catch (error) {
      console.error("Error durante la autenticación:", error);
      return false;
    }
  }
}


export function startLogin() {
  redirectToAuthCodeFlow(clientId);
}

export { clientId };

