const TOKEN_KEY = 'spotify_token';
const PRODUCT_KEY = 'spotify_product';
const DEVICE_KEY = 'spotify_device_id';

let playerInstance = null;

const scopes = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
].join('%20');

function getClientId() {
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID || localStorage.getItem('SPOTIFY_CLIENT_ID') || '';
}

function getRedirectUri() {
  return window.location.origin;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

async function parseRedirect() {
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.replace('#', ''));
    const token = params.get('access_token');
    const type = params.get('token_type');
    const expires = params.get('expires_in');
    setToken(token);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    await fetchProfile();
    return { token, type, expires };
  }
  return null;
}

function login() {
  const clientId = getClientId();
  if (!clientId) {
    alert('Configure o Spotify Client ID para conectar.');
    return;
  }
  const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(getRedirectUri())}&scope=${scopes}&show_dialog=true`;
  window.location.href = url;
}

async function fetchProfile() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data.product) localStorage.setItem(PRODUCT_KEY, data.product);
  return data;
}

function isPremium() {
  return localStorage.getItem(PRODUCT_KEY) === 'premium';
}

function loadSDK() {
  return new Promise((resolve) => {
    if (window.Spotify && window.Spotify.Player) {
      resolve();
      return;
    }
    const scriptId = 'spotify-web-playback-sdk';
    if (!document.getElementById(scriptId)) {
      const tag = document.createElement('script');
      tag.id = scriptId;
      tag.src = 'https://sdk.scdn.co/spotify-player.js';
      document.body.appendChild(tag);
    }
    const check = () => {
      if (window.Spotify && window.Spotify.Player) resolve();
      else setTimeout(check, 100);
    };
    check();
  });
}

async function initPlayer() {
  const token = getToken();
  if (!token) return null;
  await loadSDK();
  if (!playerInstance) {
    playerInstance = new window.Spotify.Player({
      name: 'Casal Memórias Player',
      getOAuthToken: cb => cb(getToken())
    });
    playerInstance.addListener('ready', ({ device_id }) => {
      localStorage.setItem(DEVICE_KEY, device_id);
    });
    playerInstance.connect();
  }
  return playerInstance;
}

async function transferPlayback() {
  const token = getToken();
  const deviceId = localStorage.getItem(DEVICE_KEY);
  if (!token || !deviceId) return false;
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ device_ids: [deviceId], play: true })
  });
  return res.status === 204;
}

function extractTrackId(url) {
  try {
    if (!url) return '';
    const u = new URL(url);
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('track');
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].split('?')[0];
  } catch {}
  return '';
}

async function playTrackByUrl(url) {
  const id = extractTrackId(url);
  if (!id) return false;
  return playTrack(id);
}

async function playTrack(trackId) {
  const token = getToken();
  const deviceId = localStorage.getItem(DEVICE_KEY);
  if (!token) return false;
  await initPlayer();
  await transferPlayback();
  const res = await fetch(`https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
  });
  return res.status === 204;
}

async function pause() {
  const token = getToken();
  if (!token) return false;
  const res = await fetch('https://api.spotify.com/v1/me/player/pause', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.status === 204;
}

async function resume() {
  const token = getToken();
  if (!token) return false;
  const res = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.status === 204;
}

export default {
  login,
  parseRedirect,
  fetchProfile,
  isPremium,
  initPlayer,
  playTrack,
  playTrackByUrl,
  pause,
  resume,
  extractTrackId
};
