 import React, { useEffect, useState, useMemo } from 'react';
 import spotify from '../services/spotifyService';
 import { usePlayer } from '../context/PlayerContext';
 
 export default function MusicPlayer({ link, title, artist, coverUrl, albumId }) {
   const { play, pause, resume, playing, track } = usePlayer();
   const [premium, setPremium] = useState(false);

  const isSpotify = link && link.includes('spotify.com');
  const isYouTube = link && (link.includes('youtube.com') || link.includes('youtu.be'));
  const videoId = useMemo(() => {
    if (!isYouTube) return '';
    if (link.includes('youtu.be')) return link.split('youtu.be/')[1];
    const urlParams = new URLSearchParams(new URL(link).search);
    return urlParams.get('v') || '';
  }, [link, isYouTube]);

   useEffect(() => {
     const init = async () => {
       await spotify.parseRedirect();
       if (isSpotify) {
         await spotify.fetchProfile();
         setPremium(spotify.isPremium());
       }
     };
     init();
   }, [isSpotify]);

  if (!link) return null;

   if (isSpotify) {
    const embedUrl = link.replace('spotify.com/', 'spotify.com/embed/');
    return (
      <div style={{ marginTop: '20px', maxWidth: '100%', width: '100%', height: 'auto', minHeight: '80px', backgroundColor: '#282828', borderRadius: '12px', display: 'flex', alignItems: 'center', overflow: 'hidden', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
          {coverUrl ? (
            <img src={coverUrl} alt={title || 'Música'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
          )}
        </div>
        <div style={{ flex: 1, padding: '8px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minWidth: '150px' }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title || 'Música Selecionada'}</span>
          <span style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist || 'Artista'}</span>
        </div>
        <div style={{ width: 'auto', display: 'flex', justifyContent: 'center', gap: '8px', padding: '8px', flexShrink: 0 }}>
          <button
            onClick={() => play({ link, title, artist, coverUrl, albumId, source: 'spotify' })}
            className="btn btn-accent"
            style={{ padding: '8px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}
          >
            {playing && track && track.link === link ? 'Reproduzindo' : 'Tocar'}
          </button>
          <button
            onClick={pause}
            className="btn btn-outline"
            style={{ padding: '8px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}
          >
            Pausar
          </button>
        </div>
         {!premium && (
           <div style={{ position: 'absolute', right: '12px', bottom: '8px' }}>
             <button
               onClick={spotify.login}
               style={{ padding: '6px 10px', borderRadius: '14px', border: '1px solid var(--text-secondary)', fontWeight: 'bold', background: 'transparent', color: 'var(--text-primary)' }}
             >
               Conectar ao Spotify
             </button>
           </div>
         )}
       </div>
     );
   }

   if (isYouTube && videoId) {
    return (
      <div style={{ marginTop: '20px', maxWidth: '100%', width: '100%', height: 'auto', minHeight: '110px', background: 'linear-gradient(135deg, #1f1f1f, #2c2c2c)', borderRadius: '16px', display: 'flex', alignItems: 'center', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', flexWrap: 'wrap' }}>
        <div style={{ width: '110px', height: '110px', flexShrink: 0 }}>
          {coverUrl ? (
            <img src={coverUrl} alt={title || 'Música'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎵</div>
          )}
        </div>
        <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minWidth: '150px' }}>
          <span style={{ color: 'white', fontWeight: '900', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title || 'Música Selecionada'}</span>
          <span style={{ color: '#b3b3b3', fontSize: '12px', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist || 'Artista'}</span>
        </div>
        <div style={{ width: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px' }}>
          <button
            onClick={() => play({ link, title, artist, coverUrl, albumId, source: 'youtube' })}
            className="btn btn-accent"
            style={{ padding: '10px 16px', borderRadius: '999px', whiteSpace: 'nowrap' }}
          >
            {playing && track && track.link === link ? 'Reproduzindo' : 'Tocar'}
          </button>
          <button
            onClick={pause}
            className="btn btn-outline"
            style={{ padding: '10px 16px', borderRadius: '999px', whiteSpace: 'nowrap' }}
          >
            Pausar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
