import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlbum } from '../services/albumService';
import { getPhotos } from '../services/photoService';
import Header from '../components/Header';
import MusicPlayer from '../components/MusicPlayer';
import BottomNav from '../components/BottomNav';

export default function AlbumDetails() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const albumData = await getAlbum(id);
      setAlbum(albumData);
      const photosData = await getPhotos(id);
      setPhotos(photosData);
    } catch (error) {
      console.error(error);
    }
  };

  if (!album) return <div>Carregando...</div>;

  return (
    <div>
      <Header />
      <div className="container">
        {/* Album Header */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ width: '232px', height: '232px', backgroundColor: '#333', boxShadow: '0 4px 60px rgba(0,0,0,0.5)', flexShrink: 0 }}>
             {album.capaUrl ? (
                <img src={album.capaUrl} alt={album.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Sem Capa</div>
              )}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>ÁLBUM</span>
            <h1 className="title-hero" style={{ margin: '8px 0' }}>{album.nome}</h1>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {album.musicaNome && (
                <span>🎵 {album.musicaNome} - {album.musicaArtista}</span>
              )}
              <span>• {photos.length} fotos</span>
            </div>

            <MusicPlayer 
              link={album.musicaLink} 
              title={album.musicaNome} 
              artist={album.musicaArtista} 
              coverUrl={album.capaUrl}
              albumId={id}
            />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Link to={`/edit-album/${id}`} className="btn btn-outline">
                Editar Álbum
              </Link>
              <Link to={`/album/${id}/add-photo`} className="btn btn-accent">
                Adicionar Foto
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showFavOnly} onChange={(e) => setShowFavOnly(e.target.checked)} />
            Mostrar favoritos
          </label>
          <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} style={{ minWidth: '160px' }}>
            <option value="">Todas as tags</option>
            {Array.from(new Set(photos.flatMap(p => p.tags || []))).map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Photos Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
          {photos
            .filter(p => !showFavOnly || p.favorito)
            .filter(p => !selectedTag || (p.tags || []).includes(selectedTag))
            .map(photo => (
            <div key={photo.id} style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#333', marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                 {photo.imagemUrl ? (
                  <img src={photo.imagemUrl} alt={photo.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                   <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sem Imagem</div>
                )}
                <button 
                  onClick={async () => {
                    const { toggleFavoritePhoto } = await import('../services/photoService');
                    await toggleFavoritePhoto(photo.id, !!photo.favorito);
                    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, favorito: !photo.favorito } : p));
                  }}
                  style={{ position: 'absolute', right: '10px', top: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: photo.favorito ? 'var(--accent)' : '#fff' }}
                  aria-label="Favorito"
                >
                  {photo.favorito ? '❤️' : '🤍'}
                </button>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{photo.titulo}</h4>
              <p style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                marginBottom: '8px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: '4',
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
                whiteSpace: 'normal'
              }}>{photo.descricao}</p>
              {(photo.tags && photo.tags.length > 0) && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {photo.tags.map(tag => (
                    <span key={tag} style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>{new Date(photo.data).toLocaleDateString()}</span>
                <span>{'⭐'.repeat(photo.nota)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
      <div style={{ height: '72px' }}></div>
    </div>
  );
}
