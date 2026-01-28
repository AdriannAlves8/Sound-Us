import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import spotify from '../services/spotifyService';

export default function GlobalPlayer() {
  const { track, playing, pause, resume } = usePlayer();
  const navigate = useNavigate();
  const [ytReady, setYtReady] = useState(false);
  const [ytDuration, setYtDuration] = useState(0);
  const [ytCurrent, setYtCurrent] = useState(0);
  const [ytVolume, setYtVolume] = useState(60);
  const ytPlayerRef = useRef(null);
  const intervalRef = useRef(null);

  const isYouTube = track && (track.link.includes('youtube.com') || track.link.includes('youtu.be'));
  const isSpotify = track && track.link.includes('spotify.com');

  const videoId = useMemo(() => {
    if (!isYouTube) return '';
    try {
      if (track.link.includes('youtu.be')) {
        const url = new URL(track.link);
        return url.pathname.slice(1);
      }
      const urlParams = new URLSearchParams(new URL(track.link).search);
      return urlParams.get('v') || '';
    } catch (e) {
      console.error('Error parsing video ID:', e);
      return '';
    }
  }, [track, isYouTube]);

  // Effect to handle player initialization and video loading
  useEffect(() => {
    if (!track) return;
    if (isSpotify) {
       // Spotify logic handled separately or via another effect if needed, 
       // but here we just focus on preventing YT reload.
       // For Spotify, we might need similar logic if it restarts.
       // But assuming Spotify is fine for now based on user report.
       return; 
    }

    let isMounted = true;

    const loadYT = () =>
      new Promise(resolve => {
        if (window.YT && window.YT.Player) resolve();
        else {
          const id = 'youtube-iframe-api';
          if (!document.getElementById(id)) {
            const tag = document.createElement('script');
            tag.id = id;
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);
          }
          const check = () => {
            if (!isMounted) return;
            if (window.YT && window.YT.Player) resolve();
            else setTimeout(check, 100);
          };
          check();
        }
      });

    const initPlayer = async () => {
      await loadYT();
      if (!isMounted) return;
      if (!videoId) return;

      if (!ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player('global-yt', {
          videoId,
          playerVars: { 
            rel: 0, 
            controls: 0,
            autoplay: playing ? 1 : 0,
            origin: window.location.origin
          },
          events: {
            onReady: () => {
              setYtReady(true);
              if (ytPlayerRef.current) {
                ytPlayerRef.current.setVolume(ytVolume);
                setYtDuration(ytPlayerRef.current.getDuration());
                if (playing && typeof ytPlayerRef.current.playVideo === 'function') {
                  ytPlayerRef.current.playVideo();
                }
              }
            },
            onStateChange: e => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                 if (!playing) resume();
              } else if (e.data === window.YT.PlayerState.PAUSED) {
                 if (playing) pause();
              }
            },
            onError: (e) => {
              console.error('YouTube Player Error:', e.data);
            }
          }
        });
      } else {
        // Only load if the video ID is different
        // We can't easily check the current video ID from the player without async calls sometimes,
        // but we can assume if this effect runs and videoId changed, we should load.
        // However, we must ensure we don't reload if we just re-rendered for other reasons.
        // Actually, we should split the effect so this only runs on [videoId].
        // But we need to verify if the player is ready.
        
        // For now, let's just assume if we are here, we want to load the video.
        // But wait, if we split the effect, we can be sure.
        
        // Use a ref to store the current videoId to compare?
        // Or just rely on the dependency array of the split effect.
        if (typeof ytPlayerRef.current.loadVideoById === 'function') {
             ytPlayerRef.current.loadVideoById(videoId);
        }
      }
    };

    // We only want to run init/load when videoId changes or track changes (which changes videoId).
    // But we need to ensure the player is created.
    // If we are already playing the same video, we shouldn't reload.
    // The issue in the previous code was that 'playing' was in the dependency array.
    // So when 'playing' changed, it re-ran the effect and called loadVideoById.
    
    // So, we will NOT include 'playing', 'ytVolume', 'pause', 'resume' in THIS effect's dependency array.
    // But we need them inside. 
    // Actually, we can't use stale values for 'playing' inside the onReady callback if we use a closure.
    // Use refs for callbacks if needed, or just rely on the separate effect to handle play/pause.
    
    initPlayer();

    return () => {
      isMounted = false;
    };
  }, [videoId, isSpotify, isYouTube]); // Removed 'playing', 'ytVolume', etc.

  // Effect to handle Play/Pause
  useEffect(() => {
    if (!ytPlayerRef.current || !ytReady || typeof ytPlayerRef.current.playVideo !== 'function') return;

    if (playing) {
      const state = ytPlayerRef.current.getPlayerState();
      // If not playing, play. 
      // Note: getPlayerState might not be perfect, but usually 1 is playing.
      if (state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
        ytPlayerRef.current.playVideo();
      }
    } else {
       const state = ytPlayerRef.current.getPlayerState();
       if (state === window.YT.PlayerState.PLAYING || state === window.YT.PlayerState.BUFFERING) {
         ytPlayerRef.current.pauseVideo();
       }
    }
  }, [playing, ytReady]);

  // Effect to handle Volume
  useEffect(() => {
    if (ytPlayerRef.current && ytReady && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(ytVolume);
    }
  }, [ytVolume, ytReady]);

  // Spotify Logic
  useEffect(() => {
    if (isSpotify && track) {
       if (playing) spotify.playTrackByUrl(track.link);
       else spotify.pause();
    }
  }, [isSpotify, track, playing]);

  // Timer Effect
  useEffect(() => {
     if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!ytPlayerRef.current || typeof ytPlayerRef.current.getCurrentTime !== 'function') return;
        const cur = ytPlayerRef.current.getCurrentTime();
        const dur = ytPlayerRef.current.getDuration();
        if (!Number.isNaN(cur)) setYtCurrent(cur);
        if (!Number.isNaN(dur)) setYtDuration(dur);
      }, 500);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
  }, []); // Run once or when needed? Actually we need it to run always. 
          // The previous code had dependencies. 
          // We can just set it once and let it check the ref.

  if (!track) return null;

  const pct = ytDuration ? Math.min(100, Math.max(0, (ytCurrent / ytDuration) * 100)) : 0;
  const onSeek = e => {
    if (!ytPlayerRef.current || !ytDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const t = ratio * ytDuration;
    ytPlayerRef.current.seekTo(t, true);
    setYtCurrent(t);
  };

  return (
    <div className="album-card" style={{ 
      position: 'fixed', 
      bottom: '16px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: 'min(640px, 92vw)', 
      display: 'flex', 
      alignItems: 'center', 
      padding: '10px 12px', 
      gap: '12px', 
      zIndex: 30 
    }}>
      <div onClick={() => navigate(`/album/${track.albumId}`)} style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer' }}>
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title || 'Capa'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>{track.title || 'Música'}</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{track.artist || ''}</span>
        </div>
        {isYouTube && (
          <>
            <div onClick={onSeek} style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', cursor: 'pointer', marginTop: '8px' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '999px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#b3b3b3', fontSize: '11px' }}>
              <span>{Math.floor(ytCurrent / 60)}:{String(Math.floor(ytCurrent % 60)).padStart(2, '0')}</span>
              <span>{Math.floor(ytDuration / 60)}:{String(Math.floor(ytDuration % 60)).padStart(2, '0')}</span>
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => (playing ? pause() : resume())}
          className="btn btn-accent"
          style={{ padding: '8px 14px' }}
        >
          {playing ? 'Pausar' : 'Tocar'}
        </button>
        {isYouTube && (
          <input type="range" min="0" max="100" value={ytVolume} onChange={(e) => setYtVolume(Number(e.target.value))} style={{ width: '70px' }} />
        )}
      </div>
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <div id="global-yt"></div>
      </div>
    </div>
  );
}
