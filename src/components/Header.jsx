import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', position: 'sticky', top: 0, zIndex: 10 }}>
      <Link to="/" className="header-brand" style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', boxShadow: '0 0 20px rgba(255,77,115,.6)' }}></span>
        Sound&Us
      </Link>
      <Link to="/create-album" className="btn btn-accent">
        Novo Álbum
      </Link>
    </header>
  );
}
