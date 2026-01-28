import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateEditAlbum from './pages/CreateEditAlbum';
import AlbumDetails from './pages/AlbumDetails';
import AddPhoto from './pages/AddPhoto';
import { PlayerProvider } from './context/PlayerContext';
import GlobalPlayer from './components/GlobalPlayer';

function App() {
  return (
    <PlayerProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-album" element={<CreateEditAlbum />} />
          <Route path="/edit-album/:id" element={<CreateEditAlbum />} />
          <Route path="/album/:id" element={<AlbumDetails />} />
          <Route path="/album/:id/add-photo" element={<AddPhoto />} />
        </Routes>
        <GlobalPlayer />
      </div>
    </PlayerProvider>
  );
}

export default App;
