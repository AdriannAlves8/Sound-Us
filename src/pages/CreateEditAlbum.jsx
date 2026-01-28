import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAlbum, getAlbum, updateAlbum } from '../services/albumService';
import { uploadImage } from '../services/photoService';
import Header from '../components/Header';

export default function CreateEditAlbum() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    capaUrl: '',
    musicaNome: '',
    musicaArtista: '',
    musicaLink: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (id) {
      loadAlbum();
    }
  }, [id]);

  const loadAlbum = async () => {
    try {
      const data = await getAlbum(id);
      setFormData(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar álbum');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = formData.capaUrl;
      if (file) {
        url = await uploadImage(file);
      }

      const dataToSave = { ...formData, capaUrl: url };

      if (id) {
        await updateAlbum(id, dataToSave);
      } else {
        await createAlbum(dataToSave);
      }
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar álbum');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '20px' }}>{id ? 'Editar Álbum' : 'Novo Álbum'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome do Álbum</label>
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              required 
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Capa do Álbum</label>
            <input type="file" onChange={handleFileChange} accept="image/*" style={{ width: '100%' }} />
            {formData.capaUrl && !file && (
              <img src={formData.capaUrl} alt="Preview" style={{ width: '100px', marginTop: '10px', borderRadius: '4px' }} />
            )}
          </div>

          <div style={{ padding: '15px', backgroundColor: 'var(--surface)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>Música Associada</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Nome da Música</label>
                <input 
                  type="text" 
                  name="musicaNome" 
                  value={formData.musicaNome} 
                  onChange={handleChange} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Artista</label>
                <input 
                  type="text" 
                  name="musicaArtista" 
                  value={formData.musicaArtista} 
                  onChange={handleChange} 
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Link (Spotify/YouTube)</label>
                <input 
                  type="url" 
                  name="musicaLink" 
                  value={formData.musicaLink} 
                  onChange={handleChange} 
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              backgroundColor: 'var(--accent)', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '25px', 
              fontWeight: 'bold', 
              marginTop: '10px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Criar Álbum')}
          </button>
        </form>
      </div>
    </div>
  );
}
