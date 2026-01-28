import React, { useEffect, useState } from 'react';
import { getAlbums, toggleFavorite } from '../services/albumService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Home() {
  const [albums, setAlbums] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const initialView = new URLSearchParams(location.search).get('view') === 'favorites' ? 'favorites' : 'all';
  const [filter, setFilter] = useState(initialView); // all | favorites
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    const data = await getAlbums();
    setAlbums(data);
  };

  const handleToggleFavorite = async (e, id, currentStatus) => {
    e.preventDefault(); // Prevent navigation
    await toggleFavorite(id, currentStatus);
    loadAlbums();
  };

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = album.nome.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'favorites' && album.favorito);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <Header />
      <div className="container">
        {/* Search Pill */}
        <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Buscar álbuns..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-pill"
            style={{ flex: 1 }}
          />
          <Link to="/create-album" className="btn btn-accent">Novo</Link>
        </div>

        {/* Chips Filter */}
        <div className="chips" style={{ marginBottom: '16px' }}>
          <button className={`chip ${filter === 'all' ? 'chip-active' : ''}`} onClick={() => { setFilter('all'); navigate('/'); }}>Todos</button>
          <button className={`chip ${filter === 'favorites' ? 'chip-active' : ''}`} onClick={() => { setFilter('favorites'); navigate('/?view=favorites'); }}>Favoritos</button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '24px' 
        }}>
          {filteredAlbums.map(album => (
            <Link to={`/album/${album.id}`} key={album.id} className="album-card" style={{ padding: '16px', display: 'block', textDecoration: 'none' }}>
              <div style={{ 
                width: '100%', 
                aspectRatio: '1', 
                backgroundColor: '#333', 
                marginBottom: '16px',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {album.capaUrl ? (
                  <img src={album.capaUrl} alt={album.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Sem Capa</div>
                )}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{album.nome}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{album.musicaArtista || 'Artista Desconhecido'}</span>
                <button 
                  onClick={(e) => handleToggleFavorite(e, album.id, album.favorito)}
                  style={{ background: 'none', color: album.favorito ? 'var(--accent)' : 'inherit', fontSize: '20px', padding: 0 }}
                >
                  {album.favorito ? '❤️' : '🤍'}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
