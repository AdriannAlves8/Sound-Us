import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const { pathname, search } = useLocation();
  const isHome = pathname === '/';
  const isCreate = pathname.startsWith('/create-album') || pathname.startsWith('/edit-album');
  const isAlbum = pathname.startsWith('/album/');

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bottom-item ${isHome ? 'active' : ''}`} aria-label="Início">🏠</Link>
      <Link to="/?view=favorites" className={`bottom-item ${isHome && search.includes('view=favorites') ? 'active' : ''}`} aria-label="Favoritos">❤️</Link>
      <Link to="/create-album" className={`bottom-item ${isCreate ? 'active' : ''}`} aria-label="Novo Álbum">➕</Link>
      <Link to={isAlbum ? pathname : '/'} className={`bottom-item ${isAlbum ? 'active' : ''}`} aria-label="Álbum">🎵</Link>
    </nav>
  );
}
