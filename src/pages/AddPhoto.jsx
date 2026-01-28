import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addPhoto, uploadImage } from '../services/photoService';
import Header from '../components/Header';

export default function AddPhoto() {
  const { id } = useParams(); // Album ID
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    nota: 5,
    data: new Date().toISOString().split('T')[0],
    tags: ''
  });

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
    if (!file) {
      alert('Por favor, selecione uma foto.');
      return;
    }

    setLoading(true);
    try {
      const url = await uploadImage(file);
      await addPhoto({
        ...formData,
        albumId: id,
        imagemUrl: url,
        nota: parseInt(formData.nota),
        favorito: false,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      navigate(`/album/${id}`);
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar foto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="container" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '20px' }}>Adicionar Foto ao Álbum</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Foto</label>
            <input type="file" onChange={handleFileChange} accept="image/*" required style={{ width: '100%' }} />
            {file && (
              <img src={URL.createObjectURL(file)} alt="Preview" style={{ width: '100%', marginTop: '10px', borderRadius: '4px' }} />
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Título</label>
            <input 
              type="text" 
              name="titulo" 
              value={formData.titulo} 
              onChange={handleChange} 
              required 
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Descrição</label>
            <textarea 
              name="descricao" 
              value={formData.descricao} 
              onChange={handleChange} 
              rows="3"
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tags (separe por vírgulas)</label>
            <input 
              type="text" 
              name="tags" 
              value={formData.tags} 
              onChange={handleChange} 
              placeholder="ex.: viagem, jantar, aniversário"
              style={{ width: '100%' }}
            />
            {formData.tags && (
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {formData.tags.split(',').map(t => (
                  <span key={t.trim()} style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '999px', fontSize: '12px' }}>
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nota do Dia (0-5)</label>
            <input 
              type="number" 
              name="nota" 
              value={formData.nota} 
              onChange={handleChange} 
              min="0"
              max="5"
              required 
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Data</label>
            <input 
              type="date" 
              name="data" 
              value={formData.data} 
              onChange={handleChange} 
              required 
              style={{ width: '100%' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-accent"
            style={{ marginTop: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Enviando...' : 'Adicionar Foto'}
          </button>
        </form>
      </div>
    </div>
  );
}
